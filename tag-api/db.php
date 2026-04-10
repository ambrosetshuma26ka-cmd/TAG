<?php
declare(strict_types=1);
date_default_timezone_set('Africa/Johannesburg');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $host    = 'localhost';
        $dbname  = 'theaucti_tag';      // e.g. theaucti_tag_bookings
        $user    = 'theaucti_tag';      // e.g. theaucti_taguser
        $pass    = 'K#x2^%9f4SwL61zb';  // your cPanel DB password
        $charset = 'utf8mb4';
        $dsn     = "mysql:host={$host};dbname={$dbname};charset={$charset}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, $user, $pass, $options);
            $pdo->exec("SET time_zone = '+02:00'");
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}