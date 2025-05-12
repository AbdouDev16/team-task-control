
<?php
// Autoriser les requêtes cross-origin (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Répondre aux requêtes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Inclure la connexion à la base de données
require_once 'config/database.php';

// Fonction pour vérifier si un fichier existe
function checkFileExists($path) {
    return [
        'exists' => file_exists($path),
        'path' => $path
    ];
}

// Initialiser la réponse
$response = [
    'timestamp' => date('Y-m-d H:i:s'),
    'api_status' => [
        'ok' => true,
        'message' => 'API fonctionnelle'
    ],
    'connection' => [
        'connected' => false,
        'message' => 'Non testé'
    ],
    'tables' => [],
    'files' => [],
    'server_info' => [
        'php_version' => PHP_VERSION,
        'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Inconnu',
        'system' => php_uname()
    ],
    'sample_queries' => [
        'Users' => "
INSERT INTO Users (username, password, role) VALUES 
('admin', 'admin', 'Admin'),
('gerant', 'gerant', 'Gérant'),
('chef_projet', 'chef_projet', 'Chef_Projet'),
('employe', 'employe', 'Employé'),
('ahmed', 'ahmed123', 'Admin'),
('fatima', 'fatima123', 'Gérant'),
('karim', 'karim123', 'Chef_Projet'),
('amina', 'amina123', 'Chef_Projet'),
('youcef', 'youcef123', 'Employé'),
('leila', 'leila123', 'Employé'),
('mohamed', 'mohamed123', 'Employé'),
('sofia', 'sofia123', 'Employé');",

        'Admin' => "
INSERT INTO Gerant (user_id, nom, prenom, email, telephone) VALUES 
(5, 'Benali', 'Ahmed', 'ahmed.benali@exemple.com', '0551234567'),
(6, 'Rahmani', 'Fatima', 'fatima.rahmani@exemple.com', '0661234567');",

        'ChefProjet' => "
INSERT INTO Chef_Projet (user_id, nom, prenom, email, telephone, specialite) VALUES 
(7, 'Meziane', 'Karim', 'karim.meziane@exemple.com', '0551234568', 'Développement Web'),
(8, 'Kaci', 'Amina', 'amina.kaci@exemple.com', '0661234568', 'Marketing Digital');",

        'Employe' => "
INSERT INTO Employe (user_id, nom, prenom, email, telephone, poste) VALUES 
(9, 'Boudiaf', 'Youcef', 'youcef.boudiaf@exemple.com', '0551234569', 'Développeur Frontend'),
(10, 'Zaidi', 'Leila', 'leila.zaidi@exemple.com', '0661234569', 'Designer UX/UI'),
(11, 'Hamdani', 'Mohamed', 'mohamed.hamdani@exemple.com', '0551234570', 'Développeur Backend'),
(12, 'Belkacem', 'Sofia', 'sofia.belkacem@exemple.com', '0661234570', 'Analyste Marketing');",

        'Projet' => "
INSERT INTO Projet (nom, description, chef_projet_id, date_debut, date_fin) VALUES 
('Site e-commerce', 'Création d\'un site e-commerce pour vendre des produits artisanaux algériens', 1, '2025-01-01', '2025-06-30'),
('Application mobile', 'Développement d\'une application mobile pour le tourisme en Algérie', 2, '2025-02-15', '2025-08-15'),
('Campagne marketing', 'Campagne de marketing digital pour promouvoir des produits cosmétiques locaux', 2, '2025-03-01', '2025-05-30'),
('Refonte site web', 'Modernisation du site web d\'une université algérienne', 1, '2025-04-15', '2025-07-15');",

        'Tache' => "
INSERT INTO Tache (nom, description, projet_id, employe_id, statut, date_debut, date_fin) VALUES 
('Maquettes UI', 'Création des maquettes UI pour le site e-commerce', 1, 2, 'En cours', '2025-01-05', '2025-01-20'),
('Développement backend', 'Mise en place de l\'API pour le site e-commerce', 1, 3, 'Non commencé', '2025-01-21', '2025-02-28'),
('Développement frontend', 'Intégration des maquettes pour le site e-commerce', 1, 1, 'Non commencé', '2025-03-01', '2025-04-15'),
('Wireframes application', 'Création des wireframes pour l\'application mobile', 2, 2, 'Non commencé', '2025-02-20', '2025-03-10'),
('Étude de marché', 'Analyse du marché pour la campagne marketing', 3, 4, 'En cours', '2025-03-05', '2025-03-25'),
('Audit SEO', 'Audit SEO du site web universitaire', 4, 3, 'Non commencé', '2025-04-20', '2025-05-05'),
('Refonte graphique', 'Nouvelle identité visuelle pour le site universitaire', 4, 2, 'Non commencé', '2025-05-06', '2025-06-10');",

        'Rapport' => "
INSERT INTO Rapport (titre, contenu, chef_projet_id, date_creation) VALUES 
('Avancement projet e-commerce', 'Le projet avance selon le planning prévu. Les maquettes sont en cours de finalisation.', 1, '2025-01-15'),
('Kickoff application mobile', 'Réunion de lancement réussie. L\'équipe est motivée et les objectifs sont clairs.', 2, '2025-02-16'),
('Résultats préliminaires', 'Les premiers résultats de l\'étude de marché sont prometteurs pour la campagne marketing.', 2, '2025-03-10'),
('Problèmes techniques', 'Nous avons rencontré quelques problèmes techniques qui pourraient retarder le projet de site e-commerce.', 1, '2025-01-25');"
    ]
];

// Vérifier les fichiers importants
$apiFiles = [
    'auth/login.php' => checkFileExists(__DIR__ . '/auth/login.php'),
    'auth/logout.php' => checkFileExists(__DIR__ . '/auth/logout.php'),
    'auth/user.php' => checkFileExists(__DIR__ . '/auth/user.php'),
    'projects/index.php' => checkFileExists(__DIR__ . '/projects/index.php'),
    'tasks/index.php' => checkFileExists(__DIR__ . '/tasks/index.php'),
    'users/index.php' => checkFileExists(__DIR__ . '/users/index.php'),
    'reports/index.php' => checkFileExists(__DIR__ . '/reports/index.php'),
    'config/database.php' => checkFileExists(__DIR__ . '/config/database.php')
];

$response['files'] = $apiFiles;

try {
    // Se connecter à la base de données
    $database = new Database();
    $db = $database->connect();
    
    // Si nous sommes ici, c'est que la connexion a réussi
    $response['connection']['connected'] = true;
    $response['connection']['message'] = 'Connexion à la base de données réussie';
    
    // Récupérer les informations sur la base de données
    $response['database_info'] = [
        'database' => $database->dbname,
        'version' => $db->getAttribute(PDO::ATTR_SERVER_VERSION),
        'charset' => $db->getAttribute(PDO::ATTR_CLIENT_VERSION)
    ];
    
    // Vérifier les tables importantes
    $tables = [
        'Users', 'Employe', 'Chef_Projet', 'Gerant', 'Projet', 'Tache', 'Rapport'
    ];
    
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SELECT COUNT(*) as count FROM $table");
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $response['tables'][$table] = [
                'exists' => true,
                'message' => 'Table trouvée',
                'count' => $count
            ];
        } catch (PDOException $e) {
            $response['tables'][$table] = [
                'exists' => false,
                'message' => "Table non trouvée: " . $e->getMessage()
            ];
        }
    }
    
} catch (PDOException $e) {
    $response['connection']['connected'] = false;
    $response['connection']['message'] = 'Erreur de connexion à la base de données: ' . $e->getMessage();
}

// Envoyer la réponse
echo json_encode($response, JSON_PRETTY_PRINT);
