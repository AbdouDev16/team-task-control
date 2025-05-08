
<?php
// Autoriser les requêtes cross-origin (CORS)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Répondre aux requêtes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier la méthode de requête
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

// Ne pas autoriser la suppression de son propre compte
if ($user_id == $_SESSION['user_id']) {
    http_response_code(400);
    echo json_encode(['message' => 'Vous ne pouvez pas supprimer votre propre compte']);
    exit();
}

// Inclure la connexion à la base de données
require_once '../config/database.php';

// Se connecter à la base de données
$database = new Database();
$db = $database->connect();

try {
    // Récupérer l'utilisateur pour vérifier les permissions
    $stmt = $db->prepare("SELECT * FROM Users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['message' => 'Utilisateur non trouvé']);
        exit();
    }
    
    // Vérifier les permissions
    if ($_SESSION['role'] === 'Gérant' && $user['role'] === 'Admin') {
        http_response_code(403);
        echo json_encode(['message' => 'Vous n\'avez pas l\'autorisation de supprimer un administrateur']);
        exit();
    }
    
    // La suppression en cascade est gérée par la contrainte de clé étrangère dans la base de données
    $query = "DELETE FROM Users WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);
    
    echo json_encode([
        'message' => 'Utilisateur supprimé avec succès'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
