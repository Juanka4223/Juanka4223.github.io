// API key
const RiotApiKey = "RGAPI-d2463f55-2335-49f1-ad52-12450c94df1a";

// Servidor
const server = "euw1";

// Jugadores del SoloQChallenge
const players = ["HuevitoMiDiosa", "huevovacio", "SuckMyLickilicky", "SuckMyUmbreon", "Moco Semεnpai", "SuckMyMush00m", "sumiguelito19", "Sususupport", "falo de latex", "Hî Îm Xâyâh", "Manguitos1", "yasuoitorl", "High0nABush", "Vasilotind", "Tipparnayam","HeartBreakBuffs","ElAfiladorSeñora", "SamiCOPPERseeker","SuckMyCiego", "Rësët"];

// Tabla
const tableHTML = document.getElementById("Table");

main();

// Funciones
async function main(){
    
    // Obtener vector de jugadores
    let playerData = new Array(players.length);
    for(let i = 0; i < players.length; i++)
        playerData[i] = await getPlayerData(players[i]);


    let aux = new Array(playerData.length);
    for(let i = 0; i < aux.length; i++)
        aux[i] = i;

    // Ordenar vector de jugadores
    var changed;
    do{
        changed = false;
        for (var i = 0; i < playerData.length - 1; i++){
            if (playerData[aux[i]][6] < playerData[aux[i + 1]][6]){
                var tmp = aux[i];
                aux[i] = aux[i + 1];
                aux[i + 1] = tmp;
                changed = true;
            }
        }
    }while (changed);

    // Mostrar vector de jugadores
    for(let i = 0; i < playerData.length; i++){
        createRow(i+1+"º", players[aux[i]], playerData[aux[i]][0], playerData[aux[i]][1], playerData[aux[i]][2], playerData[aux[i]][3], playerData[aux[i]][4], playerData[aux[i]][5]);
    }
}

function createRow(index, name, rank, lps, victorys, losses, games, winrate){

    let newRow = '<tr>';
    // Posicion
    newRow += '<td>'+ index     +'</td>';
    // Nombre
    newRow += '<td>'+ name      +'</td>';
    // Rango
    newRow += '<td>'+ rank      +'</td>';
    // Lps
    newRow += '<td>'+ lps       +'</td>';
    // Victorias
    newRow += '<td>'+ victorys   +'</td>';
    // Derrotas
    newRow += '<td>'+ losses    +'</td>';
    // Partidas
    newRow += '<td>'+ games     +'</td>';
    // Winrate
    newRow += '<td>'+ winrate   +'</td>';
    tableHTML.innerHTML += newRow + '</tr>';
}

async function getPlayerId(summonerName){

    // Nombre del jugador
    let summonerData

    let error = true;
    while(error){
        try{
            let url = "https://" + server + ".api.riotgames.com/lol/summoner/v4/summoners/by-name/" + encodeURIComponent(summonerName) + "?api_key=" + RiotApiKey;
            let response = await fetch(url);
            summonerData = await response.json();   
            error = false;        
        }
        catch{
            console.error("Error al leer datos del jugador " + summonerName + " de la API de Riot.");
            await sleep(60000);
        }
    }
    await sleep(50);

    // Id del jugador
    let summonerId = summonerData.id;

    return summonerId;
}

async function getPlayerData(summonerName){

    let summonerId = await getPlayerId(summonerName);
    let leagueData;

    let error = true;
    while(error){
        try{
            let url = "https://" + server + ".api.riotgames.com/lol/league/v4/entries/by-summoner/" + encodeURIComponent(summonerId) + "?api_key=" + RiotApiKey;
            let response = await fetch(url);

            // Datos del jugador
            leagueData = await response.json();
            error = false;
        } 
        catch{
         console.error("Error al leer datos del jugador " + summonerName + " con id " + summonerId + " de la API de Riot.");
            await sleep(60000);
        }
    }
    await sleep(50);

    // Datos de jugador por apartados
    let rank = "SIN CLASIFICAR";
    let lps = 0;
    let wins = 0;
    let losses = 0;
    let totalGames = 0;
    let winrate = "No definido";
    let points = 0;

    // Rellenar datos de cada apartado
    var encontrado = false;
    for (let i = 0; i < leagueData.length && !encontrado; i++){

        // Buscar en todas sus ligas hasta encontrar Soloq
        if(leagueData[i].queueType == "RANKED_SOLO_5x5")
        {
            rank = leagueData[i].tier + " " + leagueData[i].rank;
            lps = leagueData[i].leaguePoints;
            points += lps;
            wins = leagueData[i].wins;
            losses = leagueData[i].losses;
            totalGames = wins + losses;

            switch(leagueData[i].tier)
            {
                case "IRON":
                    points += 1;
                    rank = "HIERRO " + leagueData[i].rank;
                    break;
                case "BRONZE":
                    points += 405;
                    rank = "BRONCE " + leagueData[i].rank;
                    break;
                case "SILVER":
                    points += 809;
                    rank = "PLATA " + leagueData[i].rank;
                    break;
                case "GOLD":
                    points += 1213;
                    rank = "ORO " + leagueData[i].rank;
                    break;
                case "PLATINUM":
                    points += 1617;
                    rank = "PLATINO " + leagueData[i].rank;
                    break;
                case "DIAMOND":
                    points += 2021;
                    rank = "DIAMANTE " + leagueData[i].rank;
                    break;
            }

            switch(leagueData[i].rank){
                case "III":
                    points += 101;
                    break;
                case "II":
                    points += 202;
                    break;
                case "I":
                    points += 303;
                    break;
            }

            if (totalGames > 0) {
                winrate = (wins / totalGames) * 100;
                winrate = winrate.toFixed(2) + "%";
                points += 0.5*(wins/totalGames);
            }
        }
    }

    // Devuelve un array con los datos del jugador
    let array = [rank, lps, wins, losses, totalGames, winrate, points];
    return array;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}