
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

// Récupérer et décoder les données JSON
$data = json_decode(file_get_contents('php://input'), true);

// Inclure la connexion à la base de données
require_once '../config/database.php';

// Se connecter à la base de données
$database = new Database();
$db = $database->connect();

try {
    // Récupérer l'utilisateur actuel pour vérifier les permissions
    $stmt = $db->prepare("SELECT * FROM Users WHERE id = ?");
    $stmt->execute([$user_id]);
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existingUser) {
        http_response_code(404);
        echo json_encode(['message' => 'Utilisateur non trouvé']);
        exit();
    }
    
    // Vérifier les permissions
    if ($_SESSION['role'] === 'Gérant' && $existingUser['role'] === 'Admin') {
        http_response_code(403);
        echo json_encode(['message' => 'Vous n\'avez pas l\'autorisation de modifier un administrateur']);
        exit();
    }
    
    // Vérifier si on essaie de changer un utilisateur en Admin sans avoir les droits
    if (isset($data['role']) && $data['role'] === 'Admin' && $_SESSION['role'] !== 'Admin') {
        http_response_code(403);
        echo json_encode(['message' => 'Vous n\'avez pas l\'autorisation de créer un administrateur']);
        exit();
    }
    
    // Démarrer une transaction
    $db->beginTransaction();
    
    // Construire la requête de mise à jour pour l'utilisateur
    $updateFields = [];
    $updateValues = [];
    
    if (isset($data['username'])) {
        // Vérifier si le nom d'utilisateur existe déjà
        $stmt = $db->prepare("SELECT * FROM Users WHERE username = ? AND id != ?");
        $stmt->execute([$data['username'], $user_id]);
        
        if ($stmt->rowCount() > 0) {
            $db->rollBack();
            http_response_code(409);
            echo json_encode(['message' => 'Ce nom d\'utilisateur existe déjà']);
            exit();
        }
        
        $updateFields[] = "username = ?";
        $updateValues[] = $data['username'];
    }
    
    if (isset($data['password'])) {
        $updateFields[] = "password = ?";
        // En production, utilisez password_hash pour hacher le mot de passe
        $updateValues[] = $data['password']; // Idéalement: password_hash($data['password'], PASSWORD_DEFAULT)
    }
    
    if (isset($data['role'])) {
        $updateFields[] = "role = ?";
        $updateValues[] = $data['role'];
    }
    
    // Ajouter l'ID à la fin des valeurs
    $updateValues[] = $user_id;
    
    // Mettre à jour l'utilisateur
    if (!empty($updateFields)) {
        $query = "UPDATE Users SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute($updateValues);
    }
    
    // Mise à jour des détails spécifiques au rôle
    if (isset($data['details'])) {
        $role = isset($data['role']) ? $data['role'] : $existingUser['role'];
        
        if ($role === 'Employé') {
            // Vérifier si l'employé existe déjà
            $stmt = $db->prepare("SELECT * FROM Employe WHERE user_id = ?");
            $stmt->execute([$user_id]);
            
            if ($stmt->rowCount() > 0) {
                $query = "UPDATE Employe SET nom = ?, prenom = ? WHERE user_id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    $data['details']['nom'] ?? null,
                    $data['details']['prenom'] ?? null,
                    $user_id
                ]);
            } else {
                $query = "INSERT INTO Employe (user_id, nom, prenom) VALUES (?, ?, ?)";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    $user_id,
                    $data['details']['nom'] ?? null,
                    $data['details']['prenom'] ?? null
                ]);
            }
        } elseif ($role === 'Chef_Projet') {
            $stmt = $db->prepare("SELECT * FROM Chef_Projet WHERE user_id = ?");
            $stmt->execute([$user_id]);
            
            if ($stmt->rowCount() > 0) {
                $query = "UPDATE Chef_Projet SET nom = ?, prenom = ? WHERE user_id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    $data['details']['nom'] ?? null,
                    $data['details']['prenom'] ?? null,
                    $user_id
                ]);
            } else {
                $query = "INSERT INTO Chef_Projet (user_id, nom, prenom) VALUES (?, ?, ?)";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    $user_id,
                    $data['details']['nom'] ?? null,
                    $data['details']['prenom'] ?? null
                ]);
            }
        } elseif ($role === 'Gérant') {
            $stmt = $db->prepare("SELECT * FROM Gerant WHERE user_id = ?");
            $stmt->execute([$user_id]);
            
            if ($stmt->rowCount() > 0) {
                $query = "UPDATE Gerant SET nom = ?, prenom = ? WHERE user_id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    $data['details']['nom'] ?? null,
                    $data['details']['prenom'] ?? null,
                    $user_id
                ]);
            } else {
                $query = "INSERT INTO Gerant (user_id, nom, prenom) VALUES (?, ?, ?)";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    $user_id,
                    $data['details']['nom'] ?? null,
                    $data['details']['prenom'] ?? null
                ]);
            }
        }
    }
    
    // Valider la transaction
    $db->commit();
    
    // Récupérer l'utilisateur mis à jour
    $query = "SELECT * FROM Users WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Ne pas retourner le mot de passe
    unset($user['password']);
    
    // Récupérer les informations spécifiques au rôle
    if ($user['role'] === 'Employé') {
        $stmt = $db->prepare('SELECT * FROM Employe WHERE user_id = ?');
        $stmt->execute([$user_id]);
        $user['details'] = $stmt->fetch(PDO::FETCH_ASSOC);
    } elseif ($user['role'] === 'Chef_Projet') {
        $stmt = $db->prepare('SELECT * FROM Chef_Projet WHERE user_id = ?');
        $stmt->execute([$user_id]);
        $user['details'] = $stmt->fetch(PDO::FETCH_ASSOC);
    } elseif ($user['role'] === 'Gérant') {
        $stmt = $db->prepare('SELECT * FROM Gerant WHERE user_id = ?');
        $stmt->execute([$user_id]);
        $user['details'] = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    echo json_encode([
        'message' => 'Utilisateur mis à jour avec succès',
        'user' => $user
    ]);
} catch (PDOException $e) {
    // Annuler la transaction en cas d'erreur
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    
    http_response_code(500);
    echo json_encode(['message' => 'Erreur serveur: ' . $e->getMessage()]);
}
