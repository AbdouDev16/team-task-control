
<?php
// Autoriser les requêtes cross-origin (CORS)
header("Access-Control-Allow-Origin:  http://localhost:8081");
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

// Vérifier le rôle de l'utilisateur
$allowed_roles = ['Admin', 'Gérant'];
if (!in_array($_SESSION['role'], $allowed_roles)) {
    http_response_code(403);
    echo json_encode(['message' => 'Accès interdit']);
    exit();
}

// Inclure la connexion à la base de données
require_once '../config/database.php';

// Se connecter à la base de données
$database = new Database();
$db = $database->connect();

try {
    // Préparer la requête en fonction du rôle
    if ($_SESSION['role'] === 'Admin') {
        $query = "SELECT * FROM Users";
    } else if ($_SESSION['role'] === 'Gérant') {
        // Les gérants ne peuvent voir que les employés et les chefs de projet
        $query = "SELECT * FROM Users WHERE role IN ('Employé', 'Chef_Projet')";
    }
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Pour chaque utilisateur, récupérer les informations spécifiques selon son rôle
    foreach ($users as &$user) {
        // Ne pas retourner le mot de passe
        unset($user['password']);
        
        if ($user['role'] === 'Employé') {
            $stmt = $db->prepare('SELECT * FROM Employe WHERE user_id = ?');
            $stmt->execute([$user['id']]);
            $user['details'] = $stmt->fetch(PDO::FETCH_ASSOC);
        } elseif ($user['role'] === 'Chef_Projet') {
            $stmt = $db->prepare('SELECT * FROM Chef_Projet WHERE user_id = ?');
            $stmt->execute([$user['id']]);
            $user['details'] = $stmt->fetch(PDO::FETCH_ASSOC);
        } elseif ($user['role'] === 'Gérant') {
            $stmt = $db->prepare('SELECT * FROM Gerant WHERE user_id = ?');
            $stmt->execute([$user['id']]);
            $user['details'] = $stmt->fetch(PDO::FETCH_ASSOC);
        }
    }
    
    echo json_encode(['users' => $users]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
