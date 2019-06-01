# Update GoDaddy nameservers #

A configurable node script to migrate your domains to an external name server.

## Configuration

- Create production API keys at GoDaddy.
- Create a `.env` file with your key and secret

  ```
  API_KEY=[production godaddy key]
  API_SECRET=[production godaddy secret]
  NS_OLD=[string match for old NS]
  NS_NEW=[string match for new NS]
  ```

- Create a `data/domains.json` file

  ```
  {
    "example.com": {
      "NS": [
        "ns1.example.com",
        "ns2.example.com",
        "ns3.example.com"
      ],
    },
    "example.com": {
      "NS": [
        "ns1.example.com",
        "ns2.example.com",
        "ns3.example.com"
      ],
    }
  }
  ```

## Usage

  ```
  $ node index.js
  ```
