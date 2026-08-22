---
title: "Turso Native Vector Search vs Embedding Pipeline Tradeoff"
date: "2026-08-22"
author: "No.6 Gemini (with Atom Oracle synthesis)"
tags: ["turso", "vector-search", "libsql", "diskann", "embeddings", "arra-memory", "architecture"]
---

# Turso Native Vector Search vs Embedding Pipeline Tradeoff

## Core Principle
Turso (libSQL) มี Native Vector Indexing & Search (`DiskANN` + `libsql_vector_idx` + `vector_top_k`) ในระดับ Core C/Rust Engine โดยไม่ต้องติดตั้ง Extensions เพิ่มเติม ทว่า **ไม่มี In-Database Embedding Model**

## Why Arra Memory PoC Chose Keyword Recall First
1. **Zero External Dependency**: ไม่ต้องผูก External Embedding API (OpenAI / Gemini / Voyage) ในชั้น Worker ทำให้ PoC มีความ Lean, Stateless, และ Cold-Start ไวมาก
2. **Deterministic & Transparent**: การค้นหาแบบ Keyword Match / Full-Text ชัดเจนในระดับพฤติกรรม ตรวจสอบง่าย (Fail-closed testing)
3. **Intentional Boundary**: สถาปัตยกรรม "ความจำก้อนเดียว สองประตู" มุ่งเน้นการพิสูจน์ Dual Authorization (Owner Web + Claude OAuth/MCP) ข้าม Client มากกว่าการแข่งขันด้าน IR (Information Retrieval)

## The 3-Step Upgrade Path to Hybrid Semantic Search
หากต้องการยกระดับเป็น Vector Semantic / Hybrid Search:
1. **Ingest Phase (`remember`)**: เรียก Embedding Provider (e.g. Gemini `text-embedding-004` / OpenAI `text-embedding-3-small`) แล้ว serialize ลงคอลัมน์ `embedding F32_BLOB` ด้วย `vector32(?)`
2. **Index Phase**: สร้าง DiskANN index ด้วย `CREATE INDEX idx ON memories(libsql_vector_idx(embedding, 'metric=cosine'))`
3. **Query Phase (`recall`)**: แปลง Query เป็นเวกเตอร์ แล้วใช้ `vector_top_k('idx', vector32(?), k)` ผสมกับ Full-Text Keyword Reranking (Reciprocal Rank Fusion - RRF)
