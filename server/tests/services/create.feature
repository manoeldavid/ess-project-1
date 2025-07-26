Feature: Cadastro de músicas

	Scenario: Cadastrar nova música com dados válidos
	  Given a música "Imagine" do artista "John Lennon" não existe na plataforma
	  When uma requisição "POST" é enviada para "/musics"
	  And o corpo desta requisição contém os seguintes campos:
	    | title   | artist      | album   | releaseYear | duration | url                               | platforms       | cover                                  |
	    | Imagine | John Lennon | Imagine | 1971        | 03:04    | https://audio.example/imagine.mp3 | Spotify, Deezer | ./server/assets/img/longlive.jpg       |
	  Then estes dados devem ser salvos no banco de dados
	  And o status da resposta deve ser "201"
	  And a mensagem "Música criada com sucesso!" deve estar presente na resposta

  Scenario: Tentativa de criação com campo obrigatório faltando
	  Given a música "Imagine" do artista "John Lennon" não existe na plataforma
	  When uma requisição "POST" é enviada para "/musics"
	  And o corpo desta requisição contém os seguintes campos:
	    | title | artist      | album   | releaseYear | duration | url                               | platforms       | cover                                  |
	    |       | John Lennon | Imagine | 1971        | 03:04    | https://audio.example/imagine.mp3 | Spotify, Deezer | ./server/assets/img/longlive.jpg       |
	  Then o sistema rejeita o cadastro
	  And o status da resposta deve ser "400"
	  And a mensagem "Por favor, preencha todos os campos." deve estar presente na resposta

  Scenario: Tentar cadastrar música sem capa
	  Given a música "Imagine" do artista "John Lennon" não existe na plataforma
	  When uma requisição "POST" é enviada para "/musics"
	  And o corpo desta requisição contém os seguintes campos:
	    | title   | artist      | album   | releaseYear | duration | url                               | platforms       | cover |
	    | Imagine | John Lennon | Imagine | 1971        | 03:04    | https://audio.example/imagine.mp3 | Spotify, Deezer |       |
	  Then o sistema rejeita o cadastro
	  And o status da resposta deve ser "400"
	  And a mensagem "A capa da música é obrigatória." deve estar presente na resposta

  Scenario: Tentar cadastrar música com duração mal formatada
	  Given a música "Imagine" do artista "John Lennon" não existe na plataforma
	  When uma requisição "POST" é enviada para "/musics"
	  And o corpo desta requisição contém os seguintes campos:
	    | title   | artist      | album   | releaseYear | duration | url                               | platforms       | cover                                  |
	    | Imagine | John Lennon | Imagine | 1971        | 3:04     | https://audio.example/imagine.mp3 | Spotify, Deezer | ./server/assets/img/longlive.jpg       |
	  Then o sistema rejeita o cadastro
	  And o status da resposta deve ser "400"
	  And a mensagem "A duração deve estar no formato mm:ss" deve estar presente na resposta

  Scenario: Tentar cadastrar música com ano inválido
	  Given a música "Imagine" do artista "John Lennon" não existe na plataforma
	  When uma requisição "POST" é enviada para "/musics"
	  And o corpo desta requisição contém os seguintes campos:
	    | title   | artist      | album   | releaseYear | duration | url                               | platforms       | cover                                  |
	    | Imagine | John Lennon | Imagine | 20aa        | 03:04    | https://audio.example/imagine.mp3 | Spotify, Deezer | ./server/assets/img/longlive.jpg       |
	  Then o sistema rejeita o cadastro
	  And a resposta retorna status "400"
	  And a mensagem "O ano de lançamento deve conter 4 dígitos numéricos." deve estar presente na resposta

  Scenario: Cadastrar música já existente
	  Given já existe no sistema a música "Imagine" do artista "John Lennon"
	  When uma requisição "POST" é enviada para "/musics" com os seguintes dados:
	    | title   | artist      | album   | releaseYear | duration | url                               | platforms       | cover                                  |
	    | Imagine | John Lennon | Imagine | 1971        | 03:04    | https://audio.example/imagine.mp3 | Spotify, Deezer | ./server/assets/img/longlive.jpg       |
	  Then o sistema rejeita o cadastro
	  And a resposta retorna status "400"
	  And a mensagem "Essa música já está cadastrada no sistema." deve estar presente na resposta
