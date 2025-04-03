module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 5000000,
    },
  },
  compilers: {
    solc: {
      version: "0.5.0", // Change this to 0.5.0
      docker: false,      // Disable Docker for solc
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
