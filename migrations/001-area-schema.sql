-- Up
CREATE TABLE "area" (
  idAreaAvaliacao INTEGER,
  idAreaConhecimento INTEGER,

  PRIMARY KEY (idAreaAvaliacao, idAreaConhecimento)
);

-- Down
DROP TABLE "area";