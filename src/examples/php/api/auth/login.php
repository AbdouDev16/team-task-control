
<?php
// Autoriser les requêtes cross-origin (CORS)
header("Access-Control-Allow-Origin: http://localhost:5173"); // Ajustez selon l'URL de votre frontend React
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Répondre aux requêtes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier la méthode de requête
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Méthode non autorisée']);
    exit();
}

// Récupérer et décoder les données JSON
$data = json_decode(file_get_contents('php://input'), true);

// Vérifier que les données requises sont présentes
if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Nom d\'utilisateur et mot de passe requis']);
    exit();
}

// Connexion à la base de données
try {
    $db = new PDO(
        'mysql:host=localhost;dbname=gestion_des_projets;charset=utf8mb4',
        'root',  // Remplacer par votre nom d'utilisateur MySQL
        ''       // Remplacer par votre mot de passe MySQL
    );
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur de connexion à la base de données: ' . $e->getMessage()]);
    exit();
}

// Récupérer l'utilisateur depuis la base de données
try {
    $stmt = $db->prepare('SELECT * FROM Users WHERE username = ?');
    $stmt->execute([$data['username']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['message' => 'Identifiants incorrects']);
        exit();
    }

    // En production, vous devriez vérifier le mot de passe haché, par exemple avec password_verify()
    // Ici pour simplifier, nous comparons directement (non sécurisé pour la production)
    if ($data['password'] !== $user['password']) {
        http_response_code(401);
        echo json_encode(['message' => 'Identifiants incorrects']);
        exit();
    }

    // Créer la session
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];

    // Récupérer les informations supplémentaires selon le rôle
    $additional_info = [];
    if ($user['role'] === 'Employé') {
        $stmt = $db->prepare('SELECT * FROM Employe WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $additional_info = $stmt->fetch(PDO::FETCH_ASSOC);
    } elseif ($user['role'] === 'Chef_Projet') {
        $stmt = $db->prepare('SELECT * FROM Chef_Projet WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $additional_info = $stmt->fetch(PDO::FETCH_ASSOC);
    } elseif ($user['role'] === 'Gérant') {
        $stmt = $db->prepare('SELECT * FROM Gerant WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $additional_info = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Retourner les données utilisateur (sans le mot de passe)
    unset($user['password']);
    $user['details'] = $additional_info;

    http_response_code(200);
    echo json_encode([
        'message' => 'Connexion réussie',
        'user' => $user
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
    exit();
}
