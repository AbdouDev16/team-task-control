
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '../context/AuthContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ApiTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await fetch('http://localhost/api/test_connection.php');
        
        if (!response.ok) {
          throw new Error(`Statut HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setTestResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error('Erreur lors du test de l\'API:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestResults();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Test de l'API</CardTitle>
            <CardDescription>Vérification de la connexion à l'API et à la base de données...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur de connexion</AlertTitle>
          <AlertDescription>
            Impossible de se connecter à l'API: {error}
            <div className="mt-2">
              <p>Assurez-vous que:</p>
              <ul className="list-disc pl-5">
                <li>Le serveur XAMPP est démarré</li>
                <li>Les fichiers PHP sont dans le bon répertoire (htdocs/api)</li>
                <li>L'URL de l'API est correcte (http://localhost/api)</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test de l'API</CardTitle>
          <CardDescription>Résultats de la vérification de l'API et de la base de données</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" className="w-full">
            <TabsList>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="database">Base de données</TabsTrigger>
              <TabsTrigger value="files">Fichiers</TabsTrigger>
              <TabsTrigger value="server">Serveur</TabsTrigger>
              <TabsTrigger value="queries">Requêtes SQL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status" className="space-y-4 py-4">
              <div className="grid gap-4">
                <Alert variant={testResults?.connection?.connected ? "default" : "destructive"}>
                  {testResults?.connection?.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>Connexion à la base de données</AlertTitle>
                  <AlertDescription>
                    {testResults?.connection?.message}
                  </AlertDescription>
                </Alert>
                
                <Alert variant={testResults?.api_status?.ok ? "default" : "destructive"}>
                  {testResults?.api_status?.ok ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>API Status</AlertTitle>
                  <AlertDescription>
                    {testResults?.api_status?.message}
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
            
            <TabsContent value="database" className="py-4">
              <Accordion type="single" collapsible>
                {testResults?.tables && Object.keys(testResults.tables).map((table) => (
                  <AccordionItem value={table} key={table}>
                    <AccordionTrigger>
                      Table: {table}
                      <Badge variant={testResults.tables[table].exists ? "success" : "destructive"} className="ml-2">
                        {testResults.tables[table].exists ? "Existe" : "Manquante"}
                      </Badge>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p><strong>Message:</strong> {testResults.tables[table].message}</p>
                        {testResults.tables[table].count !== undefined && (
                          <p><strong>Nombre d'enregistrements:</strong> {testResults.tables[table].count}</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {testResults?.database_info && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Informations sur la base de données</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div><strong>Nom:</strong> {testResults.database_info.database}</div>
                    <div><strong>Version MySQL:</strong> {testResults.database_info.version}</div>
                    <div><strong>Charset:</strong> {testResults.database_info.charset}</div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="files" className="py-4">
              <div className="grid gap-2">
                {testResults?.files && Object.keys(testResults.files).map((file) => (
                  <div key={file} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <span>{file}</span>
                    {testResults.files[file].exists ? (
                      <Badge className="bg-green-500">Existe</Badge>
                    ) : (
                      <Badge variant="destructive">Manquant</Badge>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="server" className="py-4">
              {testResults?.server_info && (
                <div className="grid gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Information du serveur</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div><strong>PHP Version:</strong> {testResults.server_info.php_version}</div>
                      <div><strong>Serveur:</strong> {testResults.server_info.server}</div>
                      <div><strong>Système d'exploitation:</strong> {testResults.server_info.system}</div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="queries" className="py-4">
              {testResults?.sample_queries && (
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Requêtes SQL exemples</AlertTitle>
                    <AlertDescription>
                      Ces requêtes peuvent être exécutées dans phpMyAdmin pour ajouter des données d'exemple.
                    </AlertDescription>
                  </Alert>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {Object.keys(testResults.sample_queries).map((queryName, index) => (
                      <AccordionItem value={queryName} key={queryName}>
                        <AccordionTrigger>{queryName}</AccordionTrigger>
                        <AccordionContent>
                          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm">
                            {testResults.sample_queries[queryName]}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTest;
