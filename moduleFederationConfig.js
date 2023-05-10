const moduleFederationConfig = (moduleName, filename) => ({
  name: moduleName,
  filename: filename,
  shared: [
    {
      react: { singleton: true, eager: true, requiredVersion: "*" },
      'react-dom': { singleton: true, eager: true, requiredVersion: "*" }
    }
  ],
})

module.exports = moduleFederationConfig