-- Up
CREATE TABLE "areaUniversity" (
  id INTEGER PRIMARY KEY,
  idAreaAvaliacao INTEGER,
  idAreaConhecimento INTEGER,
  nome VARCHAR(255),
  uf VARCHAR(2),
  numeroDeProgramas INTEGER,
  numeroDeCursos INTEGER
);

-- Down
DROP TABLE "areaUniversity";