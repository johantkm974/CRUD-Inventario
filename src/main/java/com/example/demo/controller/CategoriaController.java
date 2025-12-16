package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Categoria;
import com.example.demo.repository.CategoriaRepository;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

  @Autowired
  private CategoriaRepository categoriaRepository;

  @GetMapping
  public List<Categoria> listar() {
    return categoriaRepository.findAll();
  }
}
