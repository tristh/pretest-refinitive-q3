class CodeQuiz {
  funds = [];
  constructor() {}
  getData() {
    const https = require("https");
    const options = {
      hostname: "codequiz.azurewebsites.net",
      headers: {
        "Content-Type": "text/html",
        Cookie: "hasCookie=true",
      },
    };

    return new Promise((resolve, reject) =>
      https
        .get(options, (response) => {
          let data = "";

          // called when a data chunk is received.
          response.on("data", (chunk) => {
            data += chunk;
          });

          // called when the complete response is received.
          response.on("end", () => {
            let text = JSON.stringify(data);
            const indexOfWord = text.indexOf("</table>");
            text = text.slice(0, indexOfWord);
            text = text.replace(/ |<\/tr>|<\/td>/g, "");
            text = text.split("<tr>");
            text.shift();
            text.shift();
            for (let i of text) {
              let fund = {};
              let values = i.split("<td>");
              values.shift();
              fund.fundName = values[0];
              fund.nav = values[1];
              fund.bid = values[2];
              fund.offer = values[3];
              fund.change = values[4];
              this.funds.push(fund);
              resolve(response);
            }
          });
        })
        .on("error", (error) => {
          console.log("Error: " + error.message);
          reject(error);
        })
    );
  }
  getFundData(fundName, data = "nav") {
    const index = this.funds.findIndex((x) => x.fundName == fundName);
    return this.funds[index][data];
  }
  getFundList() {
    return this.funds.map((x) => {
      return x.fundName;
    });
  }
}

const result = new CodeQuiz();
let fundName = process.argv.slice(2)[0];
result.getData().then((_) => {
  let funds = result.getFundList();
  let index = funds.findIndex((e) => e == fundName);
    if (index < 0) {
      console.log(`Fund Name is not in list (${funds})`);
    } else {
      console.log(result.getFundData(fundName));
    }
});
