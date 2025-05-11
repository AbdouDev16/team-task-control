
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

// Vérifier le rôle de l'utilisateur (seuls les admins, gérants et chefs de projet peuvent créer des projets)
$allowed_roles = ['Admin', 'Gérant', 'Chef_Projet'];
if (!in_array($_SESSION['role'], $allowed_roles)) {
    http_response_code(403);
    echo json_encode(['message' => 'Accès interdit']);
    exit();
}

// Récupérer et décoder les données JSON
$data = json_decode(file_get_contents('php://input'), true);

// Vérifier que les données requises sont présentes
if (!isset($data['nom']) || !isset($data['chef_projet_id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Données incomplètes']);
    exit();
}

// Inclure la connexion à la base de données
require_once '../config/database.php';

// Se connecter à la base de données
$database = new Database();
$db = $database->connect();

try {
    $query = "INSERT INTO Projet (nom, description, chef_projet_id, date_debut, date_fin) 
              VALUES (?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    
    $stmt->execute([
        $data['nom'],
        $data['description'] ?? null,
        $data['chef_projet_id'],
        $data['date_debut'] ?? null,
        $data['date_fin'] ?? null
    ]);
    
    $project_id = $db->lastInsertId();
    
    // Récupérer le projet créé
    $query = "SELECT p.*, cp.nom as chef_projet_nom, cp.prenom as chef_projet_prenom 
              FROM Projet p 
              LEFT JOIN Chef_Projet cp ON p.chef_projet_id = cp.id 
              WHERE p.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$project_id]);
    
    $project = $stmt->fetch(PDO::FETCH_ASSOC);
    
    http_response_code(201);
    echo json_encode([
        'message' => 'Projet créé avec succès',
        'project' => $project
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
