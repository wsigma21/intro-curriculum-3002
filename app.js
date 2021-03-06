'use strict';
// csvファイルからデータを読み取る
//Node.jsに用意されたモジュールを呼び出す
//fs(ファイルシステム)、readline(ファイルを一行ずつ読み込む)
const fs = require('fs')
const readline = require('readline');

//popu-pref.csvファイルから、ファイル読み込みを行うStreamを作成する
const rs = fs.createReadStream('./popu-pref.csv');

//作成したStreamを、readlineオブジェクトのinputとして設定し、rlオブジェクトを作成する
const rl = readline.createInterface({ 'input': rs, 'output': {} });

//key:都道府県、value:集計データ　のオブジェクト
const prefectureDataMap = new Map();

rl.on('line', (lineString) => {
    //ファイルからデータを抜き出す

    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year == 2010 || year == 2015) {
        let value = prefectureDataMap.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year == 2010) {
            value.popu10 = popu;
        }
        if (year == 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});
rl.on('close', () => {
    //都道府県ごとの変化率計算は、その県のデータが揃った後でしか正しく行えないので、closeイベントに実装する
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }

    //得られた結果を、変化率ごとに並べる
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        //降順
        //return pair2[1].change - pair1[1].change;
        //昇順：
        return pair1[1].change - pair2[1].change;
    });


    //整形して出力
    const rankingStrings = rankingArray.map(([key, value], i) => {
        return (i + 1) + '位：' + key + ': ' + value.popu10 + '=>' + value.popu15 + '　変化率:' + value.change;
    });
    console.log(rankingStrings);
});