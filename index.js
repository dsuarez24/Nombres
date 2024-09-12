const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');

const app = express();


app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());


function generarCombinaciones(nombres) {
  const combinaciones = [];


  for (let i = 0; i < nombres.length; i++) {
    for (let j = i + 1; j < nombres.length; j++) {
      combinaciones.push(`${nombres[i]}${nombres[j]}`);
      combinaciones.push(`${nombres[j]}${nombres[i]}`);
    }
  }

  
  combinaciones.push(nombres.join(''));
  combinaciones.push(nombres.reverse().join(''));

  return combinaciones;
}

async function obtenerPalabrasRelacionadas(palabra) {
  try {
    const response = await axios.get(`https://api.datamuse.com/words?ml=${palabra}&max=5`);
    return response.data.map(item => item.word);
  } catch (error) {
    console.error(`Error al obtener palabras relacionadas para "${palabra}":`, error);
    return [];
  }
}


app.post('/generar-nombres', async (req, res) => {
  const { nombres } = req.body;

  if (!nombres || !Array.isArray(nombres) || nombres.length < 2) {
    return res.status(400).json({ error: 'Se requiere un array de al menos dos nombres' });
  }

  const combinaciones = generarCombinaciones(nombres);

 
  const palabrasRelacionadas = await Promise.all(nombres.map(obtenerPalabrasRelacionadas));
  

  const sugerenciasRelacionadas = [];
  palabrasRelacionadas.flat().forEach(related => {
    nombres.forEach(nombre => {
      sugerenciasRelacionadas.push(`${nombre}${related}`);
      sugerenciasRelacionadas.push(`${related}${nombre}`);
    });
  });

  res.json({ combinaciones, sugerenciasRelacionadas });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
