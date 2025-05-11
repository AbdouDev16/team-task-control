
<?php
// Autoriser les requêtes cross-origin (CORS)
header("Access-Control-Allow-Origin:  http://localhost:8081");
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
    echo json_encode(['message' => 'ID de projet manquant']);
    exit();
}

$project_id = $_GET['id'];

// Inclure la connexion à la base de données
require_once '../config/database.php';

// Se connecter à la base de données
$database = new Database();
$db = $database->connect();

try {
    // Vérifier si le projet existe
    $query = "SELECT * FROM Projet WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$project_id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['message' => 'Projet non trouvé']);
        exit();
    }
    
    // Commencer une transaction
    $db->beginTransaction();
    
    // Supprimer d'abord les tâches associées au projet
    $query = "DELETE FROM Tache WHERE projet_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$project_id]);
    
    // Puis supprimer le projet
    $query = "DELETE FROM Projet WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$project_id]);
    
    // Valider la transaction
    $db->commit();
    
    echo json_encode([
        'message' => 'Projet supprimé avec succès'
    ]);
} catch (PDOException $e) {
    // Annuler la transaction en cas d'erreur
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
