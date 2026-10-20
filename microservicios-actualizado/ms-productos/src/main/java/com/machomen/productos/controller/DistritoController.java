package com.machomen.productos.controller;

import com.machomen.productos.model.Distrito;
import com.machomen.productos.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/distritos")
public class DistritoController {

    @Autowired
    private ProductoService service;

    @GetMapping
    public ResponseEntity<List<Distrito>> listar() {
        return ResponseEntity.ok(service.listarDistritos());
    }
}
