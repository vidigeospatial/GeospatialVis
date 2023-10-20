# Covid Vaccine Vis System

Vis system on the content of media reported during covid

### Build Instructions

`npm i`
`npm start`

## Querying

Using Gql + Apollo-client to fetch data from the graphql hosted on the server.
For more complex querying or if we need to do deeper processing before sending to frontend we need to send up a Flask Rest API inside of a docker and put that on the server.

## File System

Outline of file hierarchy.

- src
  - index.js
  - App.vue
  - routes.js
  - template.html
  - assets/
    - images/
  - store/
    - index.js
    - modules/
      - datastore.js
  - styles/
  - views/
    - Home.vue
    - About.vue
    - /components
      - LineChart.vue
      - BeeSwarm.vue
