# sensor-pool-services
A program that pools the incoming sensor data and then serve them as web services.

# Compiling and running the program

1. Assuming that you have the Java Development Kit (JDK) already, download Jetty (https://www.eclipse.org/jetty/download.html).
2. Set your CLASSPATH variable to the /lib directory of the downloaded Jetty folder, or
3. Use class path option (-cp) at compile time and at running time.
    a. for windows
      javac -cp .;<path_to_jetty_lib_folder>\\\* \*.java
      java -cp .;<path_to_jetty_lib_folder>\\\* SensorDataReceiver <web_server_address> <web_server_port> <datagram_port>
    b. for \*nix
      javac -cp .:<path_to_jetty_lib_folder>/* \*.java
      java -cp .:<path_to_jetty_lib_folder>/\* SensorDataReceiver <web_server_address> <web_server_port> <datagram_port>
