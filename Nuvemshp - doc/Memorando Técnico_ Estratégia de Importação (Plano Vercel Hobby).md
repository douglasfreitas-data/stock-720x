Este documento foca exclusivamente na estratégia técnica para viabilizar a importação de dados da Nuvemshop utilizando o **Plano Hobby (Gratuito)** da Vercel, mitigando suas limitações de tempo de execução.

---

# **Memorando Técnico: Estratégia de Importação (Plano Vercel Hobby)**

### **1\. O Desafio: Limite de Timeout**

No plano gratuito da Vercel, qualquer função *serverless* (o código que processa a importação) tem um tempo limite de execução de **10 segundos**.

* **O Risco:** Se o sistema tentar importar todos os produtos, fotos e variações da Nuvemshop em uma única chamada, a conexão será encerrada pela Vercel antes de concluir, gerando dados incompletos ou erros no banco de dados.

### **2\. Solução: Importação Escalonada (Batch Processing)**

Para garantir a estabilidade do **Stock 720x** sem custos de infraestrutura, a importação deve ser obrigatoriamente fragmentada.

#### **A. Fragmentação em Lotes**

Em vez de uma requisição única, o sistema deve ser programado para trabalhar em ciclos:

* **Tamanho do Lote:** Recomendado de **20 a 50 itens** por ciclo.  
* **Fluxo:** O PWA solicita o lote 1 \-\> Processa \-\> Salva no Supabase \-\> Retorna confirmação \-\> PWA solicita lote 2\.

#### **B. Orquestração pelo Lado do Cliente (Frontend)**

Como o limite de 10 segundos é por "chamada", quem deve controlar o progresso é a interface do usuário (o celular/tablet):

1. O app consulta quantos produtos existem na Nuvemshop (ex: 300 produtos).  
2. O app divide esse número por 50 (resultando em 6 ciclos).  
3. O app dispara 6 requisições sequenciais, garantindo que cada uma dure apenas 2 ou 3 segundos.

### **3\. Observações sobre o Plano Hobby a Longo Prazo**

* **Viabilidade:** Esta estratégia torna o plano gratuito viável indefinidamente para operações de baixo volume de vendas, como planejado.  
* **Experiência do Usuário:** Durante a "Carga Inicial" (Semana 1), é indispensável o uso de uma **barra de progresso** real no PWA. Isso evita que o usuário feche o aplicativo achando que o sistema travou, o que interromperia o escalonamento.  
* **Ponto de Atenção:** Caso o inventário cresça para milhares de itens no futuro, o tempo total de sincronização (mesmo escalonado) pode se tornar inconveniente, sendo este o único momento onde o upgrade para o plano Pro voltaria a ser discutido.

### **4\. Conclusão para o Desenvolvedor**

A implementação **não deve** utilizar uma função de importação global única. Deve-se construir um endpoint de API que aceite parâmetros de paginação (page e limit) para que a interface possa "fatiar" a carga de dados de acordo com os limites da plataforma.

---

*Este documento serve como anexo técnico à Etapa 1 do cronograma de implementação do Sistema Stock 720x.*

