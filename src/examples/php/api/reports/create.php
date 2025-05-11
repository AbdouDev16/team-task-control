
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
$allowed_roles = ['Chef_Projet'];
if (!in_array($_SESSION['role'], $allowed_roles)) {
    http_response_code(403);
    echo json_encode(['message' => 'Seuls les chefs de projet peuvent créer des rapports']);
    exit();
}

// Récupérer et décoder les données JSON
$data = json_decode(file_get_contents('php://input'), true);

// Vérifier que les données requises sont présentes
if (!isset($data['titre']) || !isset($data['contenu'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Titre et contenu requis']);
    exit();
}

// Inclure la connexion à la base de données
require_once '../config/database.php';

// Se connecter à la base de données
$database = new Database();
$db = $database->connect();

try {
    // Récupérer l'ID du chef de projet connecté
    $stmt = $db->prepare("SELECT id FROM Chef_Projet WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $chef_projet = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$chef_projet) {
        http_response_code(400);
        echo json_encode(['message' => 'Profil de chef de projet non trouvé']);
        exit();
    }
    
    $chef_projet_id = $chef_projet['id'];
    
    // Insérer le rapport
    $query = "INSERT INTO Rapport (titre, contenu, chef_projet_id) VALUES (?, ?, ?)";
    $stmt = $db->prepare($query);
    $stmt->execute([
        $data['titre'],
        $data['contenu'],
        $chef_projet_id
    ]);
    
    $report_id = $db->lastInsertId();
    
    // Récupérer le rapport créé
    $query = "SELECT r.*, cp.nom as chef_projet_nom, cp.prenom as chef_projet_prenom 
              FROM Rapport r 
              LEFT JOIN Chef_Projet cp ON r.chef_projet_id = cp.id 
              WHERE r.id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$report_id]);
    
    $report = $stmt->fetch(PDO::FETCH_ASSOC);
    
    http_response_code(201);
    echo json_encode([
        'message' => 'Rapport créé avec succès',
        'report' => $report
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
