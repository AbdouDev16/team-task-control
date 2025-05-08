
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
$allowed_roles = ['Admin', 'Gérant', 'Chef_Projet'];
if (!in_array($_SESSION['role'], $allowed_roles)) {
    http_response_code(403);
    echo json_encode(['message' => 'Accès interdit']);
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
    // Récupérer le rapport
    $query = "SELECT r.*, cp.nom as chef_projet_nom, cp.prenom as chef_projet_prenom 
              FROM Rapport r 
              LEFT JOIN Chef_Projet cp ON r.chef_projet_id = cp.id 
              WHERE r.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$report_id]);
    
    $report = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$report) {
        http_response_code(404);
        echo json_encode(['message' => 'Rapport non trouvé']);
        exit();
    }
    
    // Si c'est un chef de projet, vérifier qu'il est bien l'auteur du rapport
    if ($_SESSION['role'] === 'Chef_Projet') {
        $stmt = $db->prepare("SELECT id FROM Chef_Projet WHERE user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $chef_projet = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$chef_projet || $chef_projet['id'] != $report['chef_projet_id']) {
            http_response_code(403);
            echo json_encode(['message' => 'Vous n\'avez pas accès à ce rapport']);
            exit();
        }
    }
    
    echo json_encode(['report' => $report]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
