
<?php
// Autoriser les requêtes cross-origin (CORS)
header("Access-Control-Allow-Origin: http://localhost:5173"); // Ajustez selon l'URL de votre frontend React
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Répondre aux requêtes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier la méthode de requête
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['message' => 'Méthode non autorisée']);
    exit();
}

// Démarrer la session
session_start();

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['message' => 'Non authentifié']);
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
    $stmt = $db->prepare('SELECT id, username, role FROM Users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['message' => 'Utilisateur non trouvé']);
        exit();
    }

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

    $user['details'] = $additional_info;

    http_response_code(200);
    echo json_encode([
        'user' => $user
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
    exit();
}
