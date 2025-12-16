package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.Producto;
import com.example.demo.repository.ProductoRepository;

@RestController
@RequestMapping("/api/productos") // Agregué la barra "/" al inicio (buena práctica)
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // 1. LEER (READ) - GET
    @GetMapping
    public List<Producto> listarProductos(){
        return productoRepository.findAll();
    }

    @GetMapping("/{id}")
    public Producto obtenerProducto(@PathVariable Integer id){
        return productoRepository.findById(id).orElse(null);
    }

    // 2. CREAR (CREATE) - POST
    @PostMapping
    public Producto guardarProducto(@RequestBody Producto producto){ // Corregí mayúscula: guardarProducto
        return productoRepository.save(producto);
    }

    // 3. ACTUALIZAR (UPDATE) - PUT
    @PutMapping("/{id}")
    public Producto actualizarProducto(@PathVariable Integer id, @RequestBody Producto pd){
        Producto p = productoRepository.findById(id).orElse(null);
        
        if(p != null){
            // Actualizamos los datos del objeto 'p' (el de la BD)
            // usando los datos nuevos de 'pd' (el del usuario)
            p.setNombre(pd.getNombre());
            p.setDescripcion(pd.getDescripcion());
            p.setPrecio(pd.getPrecio());
            p.setStock(pd.getStock());
            p.setImagenUrl(pd.getImagenUrl());
            p.setCategoria(pd.getCategoria());

            // IMPORTANTE: Guardamos 'p', no 'pd'
            return productoRepository.save(p); 
        } else {
            return null;
        }
    }

    // 4. BORRAR (DELETE)
    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Integer id) {
        productoRepository.deleteById(id);
    }
}