10  FOR J = 1 TO 20
20  POT = 1
30  TERM = 1
40  FOR I = 1 TO 1000
45      TERM = TERM * J / I
50      POT = POT + TERM
60  NEXT I
70  PRINT "e ^ ";
80  PRINT J;
90  PRINT " = ";
100 PRINT POT
110 NEXT J
