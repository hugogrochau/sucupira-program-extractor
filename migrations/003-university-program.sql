-- Up
CREATE TABLE "universityProgram" (
  id VARCHAR(255) PRIMARY KEY,
  idUniversidade INTEGER,
  nome VARCHAR(255),
  nomeCoordenador VARCHAR(255),
  nomeIngles VARCHAR(255),
  areaBasica VARCHAR(255),
  areaAvaliacao VARCHAR(255),
  situacao VARCHAR(255),
  cep VARCHAR(255),
  logradouro VARCHAR(255),
  numero VARCHAR(255),
  complemento VARCHAR(255),
  bairro VARCHAR(255),
  municipio VARCHAR(255),
  fax VARCHAR(255),
  telefone VARCHAR(255),
  ramal VARCHAR(255),
  emailDoPrograma VARCHAR(255),
  url VARCHAR(255),
  inicio VARCHAR(255),
  coord_latitude INTEGER,
  coord_long INTEGER,
  nivel VARCHAR(255),
  codigoCurso VARCHAR(255),
  notaCurso INTEGER,
  dataDaRecomendacao VARCHAR(255),
  creditosEmDisciplinas INTEGER,
  creditosEmTrabalhosDeConclusao INTEGER,
  outrosCreditos INTEGER,
  equivalenciaHoraCredito INTEGER,
  situacaoCurso VARCHAR(255)
);

-- Down
DROP TABLE "universityProgram";