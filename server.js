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

app.post("/vagas", async (req, res) => {
  try {
    const { titulo, descricao, salario, localizacao, empresaId } = req.body;
    if (!titulo || !descricao || !salario || !localizacao || !empresaId) {
      return res.status(400).json({
        erro: "Preencha todos os campos de vaga e informe a EmpresaId.",
      });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: empresaId },
    });

    if (!usuario || usuario.tipoUsuario !== "empresa") {
      return res.status(403).json({
        erro: "Operação não autorizada. Apenas empresas podem publicar vagas.",
      });
    }

    const novaVaga = await prisma.job.create({
      data: {
        titulo,
        descricao,
        salario: parseFloat(salario),
        localizacao,
        empresaId,
      },
    });
    res
      .status(201)
      .json({ mensagem: "Vaga publicada com sucesso!", vaga: novaVaga });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: "Erro interno ao criar a vaga.",
    });
  }
});

app.put("/vagas/:id", async (req, res) => {
  try {
    const vagaId = parseInt(req.params.id);
    const { titulo, descricao, salario, localizacao } = req.body;

    if (!titulo || !descricao || !salario || !localizacao) {
      return res.status(400).json({
        erro: "Para edição total, envia titulo, descrição, salário e localização.",
      });
    }

    const vagaAtualizada = await prisma.job.update({
      where: { id: vagaId },
      data: {
        titulo,
        descricao,
        salario: parseFloat(salario),
        localizacao,
      },
    });
    res.status(200).json({
      mensagem: "Vaga atualizada com sucesso!",
      vaga: vagaAtualizada,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ erro: "Vaga não encontrada." });
    }
    res.status(500).json({
      erro: "Erro ao atualizar a vaga.",
    });
  }
});

app.patch("/vagas/:id/status", async (req, res) => {
  try {
    const vagaId = parseInt(req.params.id);
    const { status } = req.body;

    if (status !== "ativa" && status !== "pausada") {
      return res.status(400).json({
        erro: "O status deve ser estritamente 'ativa' ou 'pausada'",
      });
    }
    const vagaAtualizada = await prisma.job.update({
      where: { id: vagaId },
      data: { status },
    });
    res.status(200).json({
      mensagem: `Status da vaga alterado para  ${status}`,
      vaga: vagaAtualizada,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ erro: "Vaga não encontrada." });
    }
    res.status(500).json({
      erro: "Erro ao atualizar o status da vaga",
    });
  }
});

app.delete("/vagas/:id", async (req, res) => {
  try {
    const vagaId = parseInt(req.params.id);

    await prisma.job.delete({
      where: { id: vagaId },
    });
    res.status(200).json({ mensagem: "Vaga excluída com sucesso." });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({
        erro: "Vaga não encontrada para exclusão.",
      });
    }
    res.status(500).json({
      erro: "Erro ao excluir a vaga.",
    });
  }
});
// useEffect
app.get("/vagas", async (req, res) => {
  try {
    const vagas = await prisma.job.findMany({
      where: {
        status: "ativa",
      },
      orderBy: {
        criadoEm: "desc",
      },
      include: {
        empresa: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });
    res.status(200).json(vagas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar as vagas." });
  }
});

app.get("/vagas/empresa/:empresaId", async (req, res) => {
  try {
    const idDaEmpresa = parseInt(req.params.empresaId);
    const vagasDaEmpresa = await prisma.job.findMany({
      where: {
        empresaId: idDaEmpresa,
      },
      orderBy: {
        criadoEm: "desc",
      },
    });
    res.status(200).json(vagasDaEmpresa);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar as vagas da empresa" });
  }
});

app.listen(3333, () => {
  console.log("Server is running on port 3333");
});
