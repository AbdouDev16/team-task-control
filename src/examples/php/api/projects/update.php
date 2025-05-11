
<?php
// Autoriser les requêtes cross-origin (CORS)
header("Access-Control-Allow-Origin:  http://localhost:8081");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Répondre aux requêtes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier la méthode de requête
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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
    echo json_encode(['message' => 'ID de projet manquant']);
    exit();
}

$project_id = $_GET['id'];

// Récupérer et décoder les données JSON
$data = json_decode(file_get_contents('php://input'), true);

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
    
    // Construire la requête de mise à jour
    $updateFields = [];
    $updateValues = [];
    
    if (isset($data['nom'])) {
        $updateFields[] = "nom = ?";
        $updateValues[] = $data['nom'];
    }
    
    if (isset($data['description'])) {
        $updateFields[] = "description = ?";
        $updateValues[] = $data['description'];
    }
    
    if (isset($data['chef_projet_id'])) {
        $updateFields[] = "chef_projet_id = ?";
        $updateValues[] = $data['chef_projet_id'];
    }
    
    if (isset($data['date_debut'])) {
        $updateFields[] = "date_debut = ?";
        $updateValues[] = $data['date_debut'];
    }
    
    if (isset($data['date_fin'])) {
        $updateFields[] = "date_fin = ?";
        $updateValues[] = $data['date_fin'];
    }
    
    // Ajouter l'ID à la fin des valeurs
    $updateValues[] = $project_id;
    
    if (!empty($updateFields)) {
        $query = "UPDATE Projet SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute($updateValues);
    }
    
    // Récupérer le projet mis à jour
    $query = "SELECT p.*, cp.nom as chef_projet_nom, cp.prenom as chef_projet_prenom 
              FROM Projet p 
              LEFT JOIN Chef_Projet cp ON p.chef_projet_id = cp.id 
              WHERE p.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$project_id]);
    
    $project = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'message' => 'Projet mis à jour avec succès',
        'project' => $project
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
