
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
$allowed_roles = ['Admin', 'Gérant', 'Chef_Projet'];
if (!in_array($_SESSION['role'], $allowed_roles)) {
    http_response_code(403);
    echo json_encode(['message' => 'Accès interdit']);
    exit();
}

// Récupérer et décoder les données JSON
$data = json_decode(file_get_contents('php://input'), true);

// Vérifier que les données requises sont présentes
if (!isset($data['nom']) || !isset($data['projet_id']) || !isset($data['employe_id'])) {
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
    $query = "INSERT INTO Tache (nom, description, projet_id, employe_id, statut, date_debut, date_fin) 
              VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    
    $stmt->execute([
        $data['nom'],
        $data['description'] ?? null,
        $data['projet_id'],
        $data['employe_id'],
        $data['statut'] ?? 'Non commencé',
        $data['date_debut'] ?? null,
        $data['date_fin'] ?? null
    ]);
    
    $task_id = $db->lastInsertId();
    
    // Récupérer la tâche créée
    $query = "SELECT t.*, p.nom as projet_nom, e.nom as employe_nom, e.prenom as employe_prenom 
              FROM Tache t 
              LEFT JOIN Projet p ON t.projet_id = p.id 
              LEFT JOIN Employe e ON t.employe_id = e.id 
              WHERE t.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$task_id]);
    
    $task = $stmt->fetch(PDO::FETCH_ASSOC);
    
    http_response_code(201);
    echo json_encode([
        'message' => 'Tâche créée avec succès',
        'task' => $task
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
