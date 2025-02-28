require("dotenv").config();
const http = require("http");
const isString = require("lodash/isString");
const isInteger = require("lodash/isInteger");
const isUndefined = require("lodash/isUndefined");
const AppDataSource = require("./db");

const isNotValidString = (value) => !isString(value) || value.trim() === "";

const isNotValidInteger = (value) => !isInteger(value) || value < 0;

const requestListener = async (req, res) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
  }
  let body = ""
  req.on("data", (chunk) => {
    body += chunk
  })

  const creditPackageRepo = AppDataSource.getRepository("CreditPackage");
  const skillRepo = AppDataSource.getRepository("Skill");

  try {
    if (req.url === "/api/credit-package" && req.method === "GET") {
      const creditPackages = await creditPackageRepo.find({
        select: ["id", "name", "credit_amount", "price"]
      });

      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success",
        data: creditPackages,
      }));
      res.end();
    } else if (req.url === "/api/credit-package" && req.method === "POST") {
      req.on("end", async () => {
        const { name, credit_amount, price } = JSON.parse(body);

        if (isUndefined(name) || isNotValidString(name) ||
          isUndefined(credit_amount) || isNotValidInteger(credit_amount) ||
          isUndefined(price) || isNotValidInteger(price)) {
          res.writeHead(400, headers);
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確",
          }));
          res.end();
          return;
        }

        const existedCreditPackages = await creditPackageRepo.find({
          where: { name }
        });

        if (existedCreditPackages.length > 0) {
          res.writeHead(409, headers);
          res.write(JSON.stringify({
            status: "failed",
            message: "資料重複",
          }));
          res.end();
          return;
        }

        const newCreditPackage = await creditPackageRepo.create({
          name,
          credit_amount,
          price,
        });

        const {
          id,
          name: newName,
          credit_amount: newCreditAmount,
          price: newPrice,
        } = await creditPackageRepo.save(newCreditPackage);

        res.writeHead(201, headers);
        res.write(JSON.stringify({
          status: "success",
          data: {
            id,
            name: newName,
            credit_amount: newCreditAmount,
            price: newPrice,
          },
        }));
        res.end();
      })
    } else if (req.url.startsWith("/api/credit-package/") && req.method === "DELETE") {
      const id = req.url.split("/").pop();

      if (isUndefined(id) || isNotValidString(id)) {
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤",
        }));
        res.end();
        return;
      }

      const result = await creditPackageRepo.delete(id);

      if (result.affected === 0) {
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤",
        }));
        res.end();
        return;
      }

      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success",
      }));
      res.end();
    } else if (req.url === "/api/coaches/skill" && req.method === "GET") {
      const skills = await skillRepo.find({
        select: ["id", "name"]
      });

      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success",
        data: skills,
      }));
      res.end();
    } else if (req.url === "/api/coaches/skill" && req.method === "POST") {
      req.on('end', async () => {
        const { name } = JSON.parse(body);

        if (isUndefined(name) || isNotValidString(name)) {
          res.writeHead(400, headers);
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確",
          }));
          res.end();
          return;
        }

        const existedSkills = await skillRepo.find({
          where: { name }
        });

        if (existedSkills.length > 0) {
          res.writeHead(409, headers);
          res.write(JSON.stringify({
            status: "failed",
            message: "資料重複"
          }));
          res.end();
          return;
        }

        const newSkill = await skillRepo.create({ name });
        const { id, name: newName } = await skillRepo.save(newSkill);

        res.writeHead(200, headers);
        res.write(JSON.stringify({
          status: "success",
          data: {
            id,
            name: newName,
          }
        }));
        res.end();
      });
    } else if (req.url.startsWith("/api/coaches/skill/") && req.method === "DELETE") {
      const id = req.url.split("/").pop();

      if (isUndefined(id) || isNotValidString(id)) {
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }));
        res.end();
        return;
      }

      const result = await skillRepo.delete(id);

      if (result.affected === 0) {
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }));
        res.end();
        return;
      }

      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success"
      }));
      res.end();
    } else if (req.method === "OPTIONS") {
      res.writeHead(200, headers);
      res.end();
    } else {
      res.writeHead(404, headers);
      res.write(JSON.stringify({
        status: "failed",
        message: "無此網站路由",
      }));
      res.end();
    }
  } catch (error) {
    res.writeHead(500, headers);
    res.write(JSON.stringify({
      status: "error",
      message: "伺服器錯誤"
    }))
    res.end()
  }
}

const server = http.createServer(requestListener)

async function startServer() {
  await AppDataSource.initialize()
  console.log("資料庫連接成功")
  server.listen(process.env.PORT)
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
  return server;
}

module.exports = startServer();
