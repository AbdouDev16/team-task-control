
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

// Vérifier si l'ID est fourni
if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'ID de tâche manquant']);
    exit();
}

$task_id = $_GET['id'];

// Récupérer et décoder les données JSON
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['statut'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Statut manquant']);
    exit();
}

// Inclure la connexion à la base de données
require_once '../config/database.php';

// Se connecter à la base de données
$database = new Database();
$db = $database->connect();

try {
    // Vérifier si la tâche existe
    $query = "SELECT t.*, e.user_id FROM Tache t LEFT JOIN Employe e ON t.employe_id = e.id WHERE t.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$task_id]);
    
    $task = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$task) {
        http_response_code(404);
        echo json_encode(['message' => 'Tâche non trouvée']);
        exit();
    }
    
    // Vérifier les permissions selon le rôle
    if ($_SESSION['role'] === 'Employé') {
        // Un employé ne peut mettre à jour que ses propres tâches
        if ($task['user_id'] !== $_SESSION['user_id']) {
            http_response_code(403);
            echo json_encode(['message' => 'Vous n\'avez pas la permission de mettre à jour cette tâche']);
            exit();
        }
    }
    
    // Mettre à jour le statut de la tâche
    $query = "UPDATE Tache SET statut = ? WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$data['statut'], $task_id]);
    
    // Récupérer la tâche mise à jour
    $query = "SELECT t.*, p.nom as projet_nom, e.nom as employe_nom, e.prenom as employe_prenom 
              FROM Tache t 
              LEFT JOIN Projet p ON t.projet_id = p.id 
              LEFT JOIN Employe e ON t.employe_id = e.id 
              WHERE t.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$task_id]);
    
    $updatedTask = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'message' => 'Statut de la tâche mis à jour avec succès',
        'task' => $updatedTask
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
