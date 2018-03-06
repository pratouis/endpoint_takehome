# endpoint_takehome
creating endpoint that successfully handles queries from API

initial approach
------
I approached this problem wanting to minimize space complexity and decided
on using streams.  I used the [request npm package](https://github.com/request/request) because it returns a
readstream.  I use pipes to format the data, and I use mapSync to ensure that
all data going through the pipes is formatted before moving onto the next phase
of data formation.

I used handlebars to show the housing data in tables and show what queries
were used.

datastore approach
------

To implement a datastore, I will use a mongo database from mlabs, using findOne
to limit the results.  

I can still use the request stream to populate the mlab.  
