// ============================
// CONFIG
// ============================

const API_BASE = "/api/productos";
const API_CATEGORIAS = "/api/categorias";
// Si usas Live Server en otro puerto:
// const API_BASE = "http://localhost:8080/api/productos";
// const API_CATEGORIAS = "http://localhost:8080/api/categorias";

// ============================
// HELPERS
// ============================

const $ = (id) => document.getElementById(id);

function showAlert(message, type = "success") {
  const box = $("alertBox");
  box.className = `alert alert-${type}`;
  box.textContent = message;
  box.classList.remove("d-none");
  setTimeout(() => box.classList.add("d-none"), 3000);
}

function parseJsonIfPossible(text) {
  try { return JSON.parse(text); } catch { return null; }
}

async function readErrorMessage(res) {
  const text = await res.text();
  const maybeJson = parseJsonIfPossible(text);
  if (maybeJson && (maybeJson.message || maybeJson.error)) {
    return maybeJson.message || maybeJson.error;
  }
  return text || `HTTP ${res.status}`;
}

// ============================
// CATEGORÍAS
// ============================

let categoriasCache = [];

async function cargarCategorias() {
  const res = await fetch(API_CATEGORIAS);
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return await res.json();
}

function renderCategoriasSelect(categorias) {
  const sel = $("categoriaId");
  sel.innerHTML = `<option value="">Seleccione...</option>`;

  for (const c of categorias) {
    sel.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
  }
}

// Si al editar viene una categoría que no está en el select, la agregamos
function ensureCategoriaOptionExists(categoria) {
  if (!categoria?.id) return;

  const sel = $("categoriaId");
  const exists = Array.from(sel.options).some(o => Number(o.value) === Number(categoria.id));
  if (!exists) {
    const name = categoria.nombre ? categoria.nombre : `ID ${categoria.id} (no listado)`;
    const opt = document.createElement("option");
    opt.value = categoria.id;
    opt.textContent = name;
    sel.appendChild(opt);
  }
}

// ============================
// FORM
// ============================

function getProductoFromForm() {
  const categoriaIdStr = $("categoriaId").value;
  const categoriaId = Number(categoriaIdStr);

  if (!categoriaIdStr || !Number.isFinite(categoriaId) || categoriaId <= 0) {
    throw new Error("Selecciona una categoría válida.");
  }

  const precio = Number($("precio").value);
  const stock = Number($("stock").value);

  if (!Number.isFinite(precio) || precio < 0) throw new Error("Precio inválido.");
  if (!Number.isFinite(stock) || stock < 0) throw new Error("Stock inválido.");

  return {
    nombre: $("nombre").value.trim(),
    descripcion: $("descripcion").value.trim(),
    precio,
    stock,
    imagenUrl: $("imagenUrl").value.trim(),
    // ✅ ManyToOne
    categoria: { id: categoriaId }
  };
}

function resetForm() {
  $("formTitle").textContent = "Crear producto";
  $("id").value = "";
  $("nombre").value = "";
  $("descripcion").value = "";
  $("precio").value = "";
  $("stock").value = "";
  $("imagenUrl").value = "";
  $("categoriaId").value = "";

  $("btnCrear").classList.remove("d-none");
  $("btnActualizar").classList.add("d-none");
  $("btnCancelar").classList.add("d-none");
}

function fillFormForEdit(producto) {
  $("formTitle").textContent = "Editar producto";
  $("id").value = producto.id ?? "";
  $("nombre").value = producto.nombre ?? "";
  $("descripcion").value = producto.descripcion ?? "";
  $("precio").value = producto.precio ?? "";
  $("stock").value = producto.stock ?? "";
  $("imagenUrl").value = producto.imagenUrl ?? "";

  ensureCategoriaOptionExists(producto.categoria);
  $("categoriaId").value = producto.categoria?.id ?? "";

  $("btnCrear").classList.add("d-none");
  $("btnActualizar").classList.remove("d-none");
  $("btnCancelar").classList.remove("d-none");
}

// ============================
// TABLA
// ============================

function renderTabla(productos) {
  const tbody = $("tbodyProductos");
  tbody.innerHTML = "";

  if (!productos || productos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">No hay productos.</td>
      </tr>
    `;
    return;
  }

  for (const p of productos) {
    const img = p.imagenUrl
      ? `<img src="${p.imagenUrl}" alt="img" style="width:52px;height:52px;object-fit:cover;border-radius:8px;">`
      : `<span class="text-muted small">sin imagen</span>`;

    const categoriaLabel = p.categoria?.nombre
      ?? (p.categoria?.id ? `ID ${p.categoria.id}` : "");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id ?? ""}</td>
      <td>
        <div class="fw-semibold">${p.nombre ?? ""}</div>
        <div class="text-muted small">${(p.descripcion ?? "").slice(0, 45)}</div>
      </td>
      <td>${p.precio ?? ""}</td>
      <td>${p.stock ?? ""}</td>
      <td>${categoriaLabel}</td>
      <td>${img}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-warning me-2" data-action="edit" data-id="${p.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${p.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

// ============================
// API CALLS
// ============================

async function cargarProductos() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return await res.json();
}

async function obtenerProductoPorId(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return await res.json();
}

async function crearProducto(producto) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return await res.json();
}

async function actualizarProducto(id, producto) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return await res.json();
}

async function eliminarProducto(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}

// ============================
// INIT + EVENTS
// ============================

async function recargarTabla() {
  const productos = await cargarProductos();
  renderTabla(productos);
}

async function init() {
  $("year").textContent = new Date().getFullYear();

  // 1) Cargar categorías primero (para el select)
  try {
    categoriasCache = await cargarCategorias();
    renderCategoriasSelect(categoriasCache);
  } catch (e) {
    $("categoriaId").innerHTML = `<option value="">No se pudo cargar categorías</option>`;
    showAlert(`Categorías: ${e.message}`, "danger");
  }

  // 2) Cargar productos
  try {
    await recargarTabla();
  } catch (e) {
    showAlert(e.message, "danger");
  }

  $("btnRecargar").addEventListener("click", async () => {
    try {
      await recargarTabla();
      showAlert("Lista recargada ✅", "success");
    } catch (e) {
      showAlert(e.message, "danger");
    }
  });

  $("btnLimpiar").addEventListener("click", () => {
    renderTabla([]);
    resetForm();
    $("resultadoBuscar").textContent = "";
  });

  $("btnCancelar").addEventListener("click", () => resetForm());

  // POST
  $("productoForm").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    try {
      const producto = getProductoFromForm();
      await crearProducto(producto);
      await recargarTabla();
      resetForm();
      showAlert("Producto creado ✅", "success");
    } catch (e) {
      showAlert(e.message, "danger");
    }
  });

  // PUT
  $("btnActualizar").addEventListener("click", async () => {
    try {
      const id = Number($("id").value);
      if (!Number.isFinite(id) || id <= 0) throw new Error("ID inválido para actualizar.");

      const producto = getProductoFromForm();
      await actualizarProducto(id, producto);
      await recargarTabla();
      resetForm();
      showAlert("Producto actualizado ✅", "warning");
    } catch (e) {
      showAlert(e.message, "danger");
    }
  });

  // Buscar por ID
  $("btnBuscar").addEventListener("click", async () => {
    try {
      const id = Number($("buscarId").value);
      if (!Number.isFinite(id) || id <= 0) throw new Error("Ingresa un ID válido.");

      const producto = await obtenerProductoPorId(id);
      $("resultadoBuscar").textContent = JSON.stringify(producto, null, 2);
      showAlert("Producto encontrado ✅", "info");
    } catch (e) {
      $("resultadoBuscar").textContent = "";
      showAlert(e.message || "No encontrado ❌", "danger");
    }
  });

  // Acciones tabla
  $("tbodyProductos").addEventListener("click", async (ev) => {
    const btn = ev.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = Number(btn.dataset.id);

    if (!Number.isFinite(id) || id <= 0) {
      showAlert("ID inválido en la tabla.", "danger");
      return;
    }

    if (action === "edit") {
      try {
        const producto = await obtenerProductoPorId(id);
        fillFormForEdit(producto);
        showAlert("Modo edición activado ✏️", "info");
      } catch (e) {
        showAlert(e.message, "danger");
      }
    }

    if (action === "delete") {
      const ok = confirm(`¿Eliminar producto ID ${id}?`);
      if (!ok) return;

      try {
        await eliminarProducto(id);
        await recargarTabla();
        showAlert("Producto eliminado ✅", "success");
      } catch (e) {
        showAlert(e.message, "danger");
      }
    }
  });
}

init();
