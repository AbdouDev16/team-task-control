
<?php
class Database {
    private $host = 'localhost';
    public $dbname = 'gestion_des_projets';
    private $username = 'root';
    private $password = '';
    private $conn;
    
    // Méthode pour se connecter à la base de données
    public function connect() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                'mysql:host=' . $this->host . ';dbname=' . $this->dbname . ';charset=utf8mb4',
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            echo 'Erreur de connexion: ' . $e->getMessage();
        }
        
        return $this->conn;
    }
    
    // Méthode pour fermer la connexion
    public function close() {
        $this->conn = null;
    }
    
    // Méthode pour obtenir l'instance de connexion
    public function getConnection() {
        return $this->conn;
    }
}
