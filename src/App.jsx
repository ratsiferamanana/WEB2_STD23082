import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";
import { Button, Table, Form } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import Possession from "./patrimoine/models/possessions/Possession"; // Importation de la classe Possession
import Flux from "./patrimoine/models/possessions/Flux"; // Importation de la classe Flux

function App() {
  const [possessions, setPossessions] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchPossessions = async () => {
      try {
        const response = await fetch("src/data.json"); // Assurez-vous que le chemin est correct
        if (!response.ok) throw new Error("Erreur lors du chargement des données");
        const json = await response.json();

        const possessionsInstances = [];
        json.forEach(entry => {
          if (entry.model === "Patrimoine") {
            const possessions = entry.data.possessions.map(data => {
              const {
                possesseur,
                libelle,
                valeur,
                dateDebut,
                dateFin,
                tauxAmortissement,
                jour,
                valeurConstante
              } = data;

              if (valeurConstante !== undefined) {
                return new Flux(
                  possesseur.nom,
                  libelle,
                  valeur,
                  new Date(dateDebut),
                  dateFin ? new Date(dateFin) : null,
                  tauxAmortissement,
                  jour,
                  valeurConstante
                );
              } else {
                return new Possession(
                  possesseur.nom,
                  libelle,
                  valeur,
                  new Date(dateDebut),
                  dateFin ? new Date(dateFin) : null,
                  tauxAmortissement
                );
              }
            });

            possessionsInstances.push(...possessions);
          }
        });

        setPossessions(possessionsInstances);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchPossessions();
  }, []);

  const calculateTotalValue = () => {
    const total = possessions.reduce((acc, poss) => acc + poss.getValeur(endDate), 0);
    setTotalValue(total);
  };

  useEffect(() => {
    calculateTotalValue();
  }, [endDate]);

  return (
    <div className="container mt-4">
    <h1 className="mb-4 text-center">Gestion de Patrimoine</h1>
    <Form.Group controlId="formEndDate" className="mb-3">
      <Form.Label>Date de Fin</Form.Label>
      <DatePicker 
        selected={endDate} 
        onChange={(date) => setEndDate(date)} 
        dateFormat="dd/MM/yyyy" 
        className="form-control" 
      />
    </Form.Group>
    <Button variant="primary" className="mt-3" onClick={calculateTotalValue}>Calculer la valeur totale</Button>

      <Table striped bordered hover responsive className="mt-4">
        <thead className="thead-dark">
          <tr>
            <th>Libellé</th>
            <th>Valeur Initiale</th>
            <th>Date Début</th>
            <th>Date Fin</th>
            <th>Amortissement (%)</th>
            <th>Valeur Actuelle</th>
          </tr>
        </thead>
        <tbody>
          {possessions.map((poss, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-light' : 'bg-secondary text-white'}>
              <td>{poss.libelle}</td>
              <td>{poss.valeur.toFixed(2)} €</td>
              <td>{poss.dateDebut.toLocaleDateString()}</td>
              <td>{poss.dateFin ? poss.dateFin.toLocaleDateString() : 'N/A'}</td>
              <td>{poss.tauxAmortissement ? poss.tauxAmortissement.toFixed(2) : 'N/A'} %</td>
              <td>{poss.getValeur(endDate).toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="mt-4">
        <h3>Total du Patrimoine : {totalValue.toFixed(2)} €</h3>
      </div>
    </div>
  );
}

export default App;