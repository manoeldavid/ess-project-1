Feature: Deletar música

  Scenario: Deletar uma música existente com sucesso
    Given existe uma música cadastrada com musicId "007"
    When uma requisição "DELETE" é enviada para "/musics/007"
    Then o status da resposta deve ser "200"
    And a mensagem "Música removida com sucesso." deve estar presente na resposta
    And a música com id "007" não deve mais existir no banco de dados

  Scenario: Tentar deletar uma música inexistente
    Given não existe nenhuma música com musicId "999"
    When uma requisição "DELETE" é enviada para "/musics/999"
    Then o status da resposta deve ser "404"
    And a mensagem "Música não encontrada para remoção." deve estar presente na resposta
