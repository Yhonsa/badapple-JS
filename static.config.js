import path from 'path'

export default {
  basePath: "badapple",
  siteRoot: 'https://www.vws-bdsmden.fr/',
  plugins: [
    [
      require.resolve('react-static-plugin-source-filesystem'),
      {
        location: path.resolve('./src/pages'),
      },
    ],
    require.resolve('react-static-plugin-reach-router'),
    require.resolve('react-static-plugin-sitemap'),
  ],
}
