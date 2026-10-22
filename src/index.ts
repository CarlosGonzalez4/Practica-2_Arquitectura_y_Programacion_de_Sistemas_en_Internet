import express from "express";
import type { Request, Response, NextFunction } from "express";

type Libro = {
  id: number;
  titulo: string;
  autor: string;
  año: number;
  disponible: boolean;
};

type Prestamo = {
  id: number;
  libroId: number;
  usuario: string;
  fechaPrestamo: string;
  fechaDevolucion: string | null;
};

let libros: Libro[] = [
  { id: 1, titulo: "Clean Code", autor: "Robert C. Martin", año: 2008, disponible: true },
  { id: 2, titulo: "El Quijote", autor: "Miguel de Cervantes", año: 1605, disponible: true },
  { id: 3, titulo: "Sapiens", autor: "Yuval Noah Harari", año: 2011, disponible: false },
];

let prestamos: Prestamo[] = [
  { id: 1, libroId: 3, usuario: "Ana", fechaPrestamo: "2026-10-01", fechaDevolucion: null },
];

let siguienteLibroId = Math.max(0, ...libros.map((l) => l.id)) + 1;
let siguientePrestamoId = Math.max(0, ...prestamos.map((p) => p.id));

const MAX_PRESTAMOS_POR_USUARIO = 2;

const app = express();
app.use(express.json());

// LIBROS

// GET /libros
app.get("/libros", (_req: Request, res: Response) => {
  res.status(200).json(libros);
});

// GET /libros/:id
app.get("/libros/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "El id debe ser un número entero positivo" });
  }
  const libro = libros.find((l) => l.id === id);
  if (!libro) {
    return res.status(404).json({ error: `No existe ningún libro con id ${id}` });
  }
  res.status(200).json(libro);
});

// POST /libros
app.post("/libros", (req: Request, res: Response) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const titulo = body.titulo;
  const autor = body.autor;
  const año = body["año"] !== undefined ? body["año"] : body["anio"];

  if (
    typeof titulo !== "string" ||
    titulo.trim().length === 0 ||
    typeof autor !== "string" ||
    autor.trim().length === 0 ||
    typeof año !== "number" ||
    !Number.isInteger(año)
  ) {
    return res.status(400).json({
      error: "Campos obligatorios: titulo (texto), autor (texto) y año (número entero)",
    });
  }

  const duplicado = libros.some(
    (l) =>
      l.titulo.trim().toLowerCase() === titulo.trim().toLowerCase() &&
      l.autor.trim().toLowerCase() === autor.trim().toLowerCase()
  );

  if (duplicado) {
    return res.status(409).json({ error: "Ya existe un libro con ese título y autor" });
  }
  const nuevo: Libro = {
    id: siguienteLibroId++,
    titulo: titulo.trim(),
    autor: autor.trim(),
    año,
    disponible: true,
  };

  libros.push(nuevo);
  res.status(201).json(nuevo);
});

// PUT /libros/:id
app.put("/libros/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "El id debe ser un número entero positivo" });
  }
  const libro = libros.find((l) => l.id === id);
  if (!libro) {
    return res.status(404).json({ error: `No existe ningún libro con id ${id}` });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const titulo = body.titulo;
  const autor = body.autor;
  const año = body["año"] !== undefined ? body["año"] : body["anio"];

  if (
    typeof titulo !== "string" ||
    titulo.trim().length === 0 ||
    typeof autor !== "string" ||
    autor.trim().length === 0 ||
    typeof año !== "number" ||
    !Number.isInteger(año)
  ) {
    return res.status(400).json({
      error: "PUT exige todos los campos: titulo (texto), autor (texto) y año (número entero)",
    });
  }

  const duplicado = libros.some(
    (l) =>
      l.id !== libro.id &&
      l.titulo.trim().toLowerCase() === titulo.trim().toLowerCase() &&
      l.autor.trim().toLowerCase() === autor.trim().toLowerCase()
  );

  if (duplicado) {
    return res.status(409).json({ error: "Ya existe otro libro con ese título y autor" });
  }
  libro.titulo = titulo.trim();
  libro.autor = autor.trim();
  libro.año = año;

  res.status(200).json(libro);
});

// PATCH /libros/:id
app.patch("/libros/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "El id debe ser un número entero positivo" });
  }
  const libro = libros.find((l) => l.id === id);
  if (!libro) {
    return res.status(404).json({ error: `No existe ningún libro con id ${id}` });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const año = body["año"] !== undefined ? body["año"] : body["anio"];
  const hayCampos =
    body.titulo !== undefined ||
    body.autor !== undefined ||
    año !== undefined;

  if (!hayCampos) {
    return res.status(400).json({
      error: "Debes enviar al menos uno de estos campos: titulo, autor, año",
    });
  }
  if (
    body.titulo !== undefined &&
    (typeof body.titulo !== "string" || body.titulo.trim().length === 0)
  ) {
    return res.status(400).json({ error: "titulo debe ser un texto no vacío" });
  }
  if (
    body.autor !== undefined &&
    (typeof body.autor !== "string" || body.autor.trim().length === 0)
  ) {
    return res.status(400).json({ error: "autor debe ser un texto no vacío" });
  }
  if (año !== undefined && (typeof año !== "number" || !Number.isInteger(año))) {
    return res.status(400).json({ error: "año debe ser un número entero" });
  }

  const nuevoTitulo =
    body.titulo !== undefined ? (body.titulo as string).trim() : libro.titulo;
  const nuevoAutor =
    body.autor !== undefined ? (body.autor as string).trim() : libro.autor;
  const duplicado = libros.some(
    (l) =>
      l.id !== libro.id &&
      l.titulo.trim().toLowerCase() === nuevoTitulo.toLowerCase() &&
      l.autor.trim().toLowerCase() === nuevoAutor.toLowerCase()
  );

  if (duplicado) {
    return res.status(409).json({ error: "Ya existe otro libro con ese título y autor" });
  }
  libro.titulo = nuevoTitulo;
  libro.autor = nuevoAutor;
  if (año !== undefined) {
    libro.año = año as number;
  }

  res.status(200).json(libro);
});

// DELETE /libros/:id
app.delete("/libros/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "El id debe ser un número entero positivo" });
  }
  const libro = libros.find((l) => l.id === id);
  if (!libro) {
    return res.status(404).json({ error: `No existe ningún libro con id ${id}` });
  }
  const prestamoActivo = prestamos.find(
    (p) => p.libroId === libro.id && p.fechaDevolucion === null
  );
  if (!libro.disponible || prestamoActivo) {
    return res.status(409).json({ error: "No se puede borrar un libro que está prestado" });
  }
  libros = libros.filter((l) => l.id !== libro.id);
  res.status(204).send();
});

// PRÉSTAMOS

// GET /prestamos
app.get("/prestamos", (_req: Request, res: Response) => {
  res.status(200).json(prestamos);
});

// GET /libros/:id/prestamos
app.get("/libros/:id/prestamos", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "El id debe ser un número entero positivo" });
  }
  const libro = libros.find((l) => l.id === id);
  if (!libro) {
    return res.status(404).json({ error: `No existe ningún libro con id ${id}` });
  }
  res.status(200).json(prestamos.filter((p) => p.libroId === libro.id));
});

// POST /libros/:id/prestar
app.post("/libros/:id/prestar", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "El id debe ser un número entero positivo" });
  }
  const libro = libros.find((l) => l.id === id);
  if (!libro) {
    return res.status(404).json({ error: `No existe ningún libro con id ${id}` });
  }
  const body = (req.body ?? {}) as Record<string, unknown>;
  const usuario = body.usuario;

  if (typeof usuario !== "string" || usuario.trim().length === 0) {
    return res.status(400).json({
      error: "usuario es obligatorio y debe ser un texto no vacío",
    });
  }
  if (!libro.disponible) {
    return res.status(409).json({ error: "El libro ya está prestado" });
  }

  const nombre = usuario.trim();
  const activos = prestamos.filter(
    (p) =>
      p.usuario.toLowerCase() === nombre.toLowerCase() &&
      p.fechaDevolucion === null
  ).length;

  if (activos >= MAX_PRESTAMOS_POR_USUARIO) {
    return res.status(409).json({
      error: `${nombre} ya tiene ${MAX_PRESTAMOS_POR_USUARIO} libros prestados (límite alcanzado)`,
    });
  }

  const prestamo: Prestamo = {
    id: siguientePrestamoId++,
    libroId: libro.id,
    usuario: nombre,
    fechaPrestamo: new Date().toISOString().slice(0, 10),
    fechaDevolucion: null,
  };

  prestamos.push(prestamo);
  libro.disponible = false;

  res.status(201).json(prestamo);
});

// POST /libros/:id/devolver
app.post("/libros/:id/devolver", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "El id debe ser un número entero positivo" });
  }

  const libro = libros.find((l) => l.id === id);
  if (!libro) {
    return res.status(404).json({ error: `No existe ningún libro con id ${id}` });
  }

  const prestamo = prestamos.find(
    (p) => p.libroId === libro.id && p.fechaDevolucion === null
  );
  if (libro.disponible || !prestamo) {
    return res.status(409).json({
      error: "El libro no está prestado, no se puede devolver",
    });
  }

  prestamo.fechaDevolucion = new Date().toISOString().slice(0, 10);
  libro.disponible = true;

  res.status(200).json(prestamo);
});

// ESTADÍSTICAS
app.get("/estadisticas", (_req: Request, res: Response) => {
  const conteo = new Map<string, number>();

  for (const libro of libros) {
    conteo.set(libro.autor, (conteo.get(libro.autor) ?? 0) + 1);
  }
  let autorConMasLibros: { autor: string; libros: number } | null = null;
  for (const [autor, cantidad] of conteo) {
    if (
      autorConMasLibros === null ||
      cantidad > autorConMasLibros.libros
    ) {
      autorConMasLibros = { autor, libros: cantidad };
    }
  }

  const disponibles = libros.filter((l) => l.disponible).length;
  res.status(200).json({
    totalLibros: libros.length,
    disponibles,
    prestados: libros.length - disponibles,
    autorConMasLibros,
  });
});

// RUTA NO ENCONTRADA
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// GESTIÓN DE ERRORES
app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err?.type === "entity.parse.failed") {
      return res.status(400).json({ error: "El body no es un JSON válido" });
    }
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
);

// ARRANQUE DEL SERVIDOR
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});