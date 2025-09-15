terraform {
  required_version = ">= 1.5.0"
  required_providers {
    random = {
      source  = "hashicorp/random"
      version = ">= 3.5.1"
    }
  }
}

provider "random" {}

resource "random_id" "example" {
  byte_length = 4
}

output "example_id" {
  value = random_id.example.hex
}






