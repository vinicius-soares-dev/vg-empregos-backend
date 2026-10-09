import express from "express";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.post("/cadastro", async (req, res) => {
  try {
    const { nome, email, senha, tipoUsuario, documento } = req.body;

    if (!nome || !email || !senha || !tipoUsuario || !documento) {
      return res.status(400).json({
        erro: "Preencha todos os campos obrigatorios",
      });
    }

    const novoUsuario = await prisma.user.create({
      data: { nome, email, senha, tipoUsuario, documento },
    });

    res.status(201).json({
      mensagem: "Usuario cadastrado com sucesso!",
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipoUsuario: novoUsuario.tipoUsuario,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(400).json({
        erro: "Este e-mail já está cadastrado.",
      });
    }
    res.status(500).json({
      erro: "Erro interno no servidor.",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const senha = req.body.senha;
 
    
    if (!email || !senha) {
      return res.status(400).json({ erro: "Preencha email e senha" });
    }
 
    
    const usuario = await prisma.user.findUnique({
      where: { email: email },
    });
 
    
    if (!usuario) {
      return res.status(401).json({ erro: "Email ou senha incorretos" });
    }
 
    
    if (usuario.senha !== senha) {
      return res.status(401).json({ erro: "Email ou senha incorretos" });
    }
 
    
    res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

app.listen(3333, () => {
  console.log("Server is running on port 3333");
});