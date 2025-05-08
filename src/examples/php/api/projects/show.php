
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
    // Récupérer le projet
    $query = "SELECT p.*, cp.nom as chef_projet_nom, cp.prenom as chef_projet_prenom 
              FROM Projet p 
              LEFT JOIN Chef_Projet cp ON p.chef_projet_id = cp.id 
              WHERE p.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$project_id]);
    
    $project = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$project) {
        http_response_code(404);
        echo json_encode(['message' => 'Projet non trouvé']);
        exit();
    }
    
    // Récupérer les tâches associées au projet
    $query = "SELECT t.*, e.nom as employe_nom, e.prenom as employe_prenom 
              FROM Tache t 
              LEFT JOIN Employe e ON t.employe_id = e.id 
              WHERE t.projet_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$project_id]);
    
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $project['tasks'] = $tasks;
    
    echo json_encode(['project' => $project]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
