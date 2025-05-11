
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

// Vérifier si l'ID est fourni
if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'ID de rapport manquant']);
    exit();
}

$report_id = $_GET['id'];

// Inclure la connexion à la base de données
require_once '../config/database.php';

// Se connecter à la base de données
$database = new Database();
$db = $database->connect();

try {
    // Récupérer le rapport pour vérifier les permissions
    $query = "SELECT * FROM Rapport WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$report_id]);
    
    $report = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$report) {
        http_response_code(404);
        echo json_encode(['message' => 'Rapport non trouvé']);
        exit();
    }
    
    // Vérifier les permissions selon le rôle
    if ($_SESSION['role'] === 'Chef_Projet') {
        // Récupérer l'ID du chef de projet connecté
        $stmt = $db->prepare("SELECT id FROM Chef_Projet WHERE user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $chef_projet = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$chef_projet || $chef_projet['id'] != $report['chef_projet_id']) {
            http_response_code(403);
            echo json_encode(['message' => 'Vous ne pouvez supprimer que vos propres rapports']);
            exit();
        }
    } elseif (!in_array($_SESSION['role'], ['Admin', 'Gérant'])) {
        http_response_code(403);
        echo json_encode(['message' => 'Accès interdit']);
        exit();
    }
    
    // Supprimer le rapport
    $query = "DELETE FROM Rapport WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$report_id]);
    
    echo json_encode([
        'message' => 'Rapport supprimé avec succès'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
