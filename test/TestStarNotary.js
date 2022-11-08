const StarNotary = artifacts.require('StarNotary');

let instance;
let accounts;

contract('SrarNotary', async(accs) => {
    accounts = accs;
    instance = await StarNotary.deployed();
});

it('can Create a Star', async() => {
    let tokenId = 1;
    await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] });
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let user1 = accounts[1]
    let starId = 2;
    let starPrice = web3.toWei(.01, "ehter");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user get the fund after the sale', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.toWei(.01, "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUserBeforTransaction = web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: starPrice });
    let balanceOfUserAfterTransaction = webe.eth.getBalance(user1);
    assert.equal(balanceOfUserBeforTransaction.add(starPrice).toNumber(), balanceOfUserAfterTransaction.toNumber());
});

it('lets user2 buy a star if its put up for sale', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.toWei(.01, "ether");
    await instance.createStar('awsome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUserBeforTransaction = web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, vaule: starPrice });
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decrease its balance in ether', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.toWei(.01, "ether");
    await instance.createStar('awsome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    const balanceOfUserBeforTransaction = web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, vaule: starPrice });
    const balanceOfUserAfterTransaction = web3.eth.getBalance(user2);
    assert.equal(balanceOfUserBeforTransaction.sub(balanceOfUserAfterTransaction), starPrice);
});

it('has a name', async function() {
    const name = await instance.name();
    assert.equal(name, 'Star Notary Service');
});

it('has a symbol', async function() {
    const symbol = await instance.symbol();
    assert.equal(symbol, "SNS");
});

it('exchange two stars', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId1 = 2133;
    let starId2 = 2432;
    await instance.createStar('awesome star from user 1', starId1, { from: user1 });
    await instance.createStar('awesome star from user 2', starId2, { from: user2 });

    assert.equal(await instance.ownerOf.call(starId1), user1);
    assert.equal(await instance.ownerOf.call(starId2), user2);

    assert.equal(await instance.starsForExchange.call(starId1), 0);
    assert.equal(await instance.starsForExchange.call(starId2), 0);

    await instance.exchangeStars(starId1, starId2, { from: user1 });

    assert.equal(await instance.starsForExchange.call(starId1), starId2);

    assert.equal(await instance.ownerOf.call(starId1), user1);
    assert.equal(await instance.ownerOf.call(starId2), user2);

    await instance.exchangeStars(starId2, starId1, { from: user2 });

    assert.equal(await instance.strtsForExchange.call(starId1), 0);
    assert.equal(await instance.starsForExchange.call(starId2), 0);

    assert.equal(await instance.ownerOf.call(starId2), user1);
    assert.equal(await instance.ownerOf.call(starId1), user2);
});

it('transfer a star to another address', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId1 = 5433;
    await instance.createStar('transferable star', starId1, { from: user1 });
    assert.equal(await instance.ownerOf.call(starId1), user1);
    await instance.transferStar(starId1, user2, { from: user1 });
    assert.equal(await instance.ownerOf.call(starId1), user2);
});