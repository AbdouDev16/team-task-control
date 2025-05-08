
<?php
// Autoriser les requêtes cross-origin (CORS)
header("Access-Control-Allow-Origin: http://localhost:5173");
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

// Vérifier si l'ID est fourni
if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'ID d\'utilisateur manquant']);
    exit();
}

$user_id = $_GET['id'];

// Inclure la connexion à la base de données
require_once '../config/database.php';

// Se connecter à la base de données
$database = new Database();
$db = $database->connect();

try {
    // Récupérer l'utilisateur
    $query = "SELECT * FROM Users WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['message' => 'Utilisateur non trouvé']);
        exit();
    }
    
    // Vérifier les permissions selon le rôle
    if ($_SESSION['role'] === 'Gérant' && $user['role'] === 'Admin') {
        http_response_code(403);
        echo json_encode(['message' => 'Accès interdit']);
        exit();
    }
    
    // Ne pas retourner le mot de passe
    unset($user['password']);
    
    // Récupérer les informations supplémentaires selon le rôle
    if ($user['role'] === 'Employé') {
        $stmt = $db->prepare('SELECT * FROM Employe WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $user['details'] = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Récupérer les tâches associées à l'employé
        if ($user['details']) {
            $stmt = $db->prepare('SELECT t.*, p.nom as projet_nom FROM Tache t JOIN Projet p ON t.projet_id = p.id WHERE t.employe_id = ?');
            $stmt->execute([$user['details']['id']]);
            $user['tasks'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } elseif ($user['role'] === 'Chef_Projet') {
        $stmt = $db->prepare('SELECT * FROM Chef_Projet WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $user['details'] = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Récupérer les projets gérés par le chef de projet
        if ($user['details']) {
            $stmt = $db->prepare('SELECT * FROM Projet WHERE chef_projet_id = ?');
            $stmt->execute([$user['details']['id']]);
            $user['projects'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } elseif ($user['role'] === 'Gérant') {
        $stmt = $db->prepare('SELECT * FROM Gerant WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $user['details'] = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    echo json_encode(['user' => $user]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
