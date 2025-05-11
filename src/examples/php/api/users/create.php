
<?php
// Autoriser les requêtes cross-origin (CORS)
header("Access-Control-Allow-Origin:  http://localhost:8081");
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

// Démarrer la session
session_start();

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['message' => 'Non authentifié']);
    exit();
}

// Vérifier le rôle de l'utilisateur
$allowed_roles = ['Admin', 'Gérant'];
if (!in_array($_SESSION['role'], $allowed_roles)) {
    http_response_code(403);
    echo json_encode(['message' => 'Accès interdit']);
    exit();
}

// Récupérer et décoder les données JSON
$data = json_decode(file_get_contents('php://input'), true);

// Vérifier que les données requises sont présentes
if (!isset($data['username']) || !isset($data['password']) || !isset($data['role'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Données incomplètes']);
    exit();
}

// Vérifier les autorisations pour créer certains types d'utilisateurs
if ($_SESSION['role'] === 'Gérant' && $data['role'] === 'Admin') {
    http_response_code(403);
    echo json_encode(['message' => 'Vous n\'avez pas l\'autorisation de créer un administrateur']);
    exit();
}

// Inclure la connexion à la base de données
require_once '../config/database.php';

// Se connecter à la base de données
$database = new Database();
$db = $database->connect();

try {
    // Vérifier si le nom d'utilisateur existe déjà
    $stmt = $db->prepare("SELECT * FROM Users WHERE username = ?");
    $stmt->execute([$data['username']]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(['message' => 'Ce nom d\'utilisateur existe déjà']);
        exit();
    }
    
    // Démarrer une transaction
    $db->beginTransaction();
    
    // Insérer le nouvel utilisateur
    // En production, utilisez password_hash pour hacher le mot de passe
    $query = "INSERT INTO Users (username, password, role) VALUES (?, ?, ?)";
    $stmt = $db->prepare($query);
    $stmt->execute([
        $data['username'],
        $data['password'], // Idéalement, utilisez: password_hash($data['password'], PASSWORD_DEFAULT)
        $data['role']
    ]);
    
    $user_id = $db->lastInsertId();
    
    // Insérer des détails supplémentaires selon le rôle
    if ($data['role'] === 'Employé' && isset($data['details'])) {
        $query = "INSERT INTO Employe (user_id, nom, prenom) VALUES (?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $user_id,
            $data['details']['nom'] ?? null,
            $data['details']['prenom'] ?? null
        ]);
    } elseif ($data['role'] === 'Chef_Projet' && isset($data['details'])) {
        $query = "INSERT INTO Chef_Projet (user_id, nom, prenom) VALUES (?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $user_id,
            $data['details']['nom'] ?? null,
            $data['details']['prenom'] ?? null
        ]);
    } elseif ($data['role'] === 'Gérant' && isset($data['details'])) {
        $query = "INSERT INTO Gerant (user_id, nom, prenom) VALUES (?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $user_id,
            $data['details']['nom'] ?? null,
            $data['details']['prenom'] ?? null
        ]);
    }
    
    // Valider la transaction
    $db->commit();
    
    // Récupérer l'utilisateur créé
    $query = "SELECT * FROM Users WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Ne pas retourner le mot de passe
    unset($user['password']);
    
    http_response_code(201);
    echo json_encode([
        'message' => 'Utilisateur créé avec succès',
        'user' => $user
    ]);
} catch (PDOException $e) {
    // Annuler la transaction en cas d'erreur
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
