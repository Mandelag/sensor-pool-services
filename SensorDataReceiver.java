import java.net.DatagramSocket;
import java.net.DatagramPacket;
import java.net.SocketException;
import java.io.IOException;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.EOFException;
import java.net.InetAddress;
import java.net.SocketAddress;
import java.net.InetSocketAddress;
import java.util.concurrent.ConcurrentHashMap;
import java.net.SocketTimeoutException;
import java.util.Set;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

/**
 *  Runnables that pool data from the sensors to a HashMap of InetSocketAddress and contantly changing measurement strings.
 *  
 */
public class SensorDataReceiver implements Runnable{

    private String ipAddress;
    private int port;
    private ConcurrentHashMap<SocketAddress, String> sensors = new ConcurrentHashMap<>();
    private ConcurrentHashMap<SocketAddress, Long> lastUpdated = new ConcurrentHashMap<>();
    
    public SensorDataReceiver(String ipAddress, int port){
        this.ipAddress = ipAddress;
        this.port = port;
    }

    public void run(){
        try(DatagramSocket ds = new DatagramSocket(port, InetAddress.getByName(ipAddress))){
            ds.setSoTimeout(100);
            byte[] buf = new byte[511];
            DatagramPacket dp = null;
            String data = "";
            String entry = "";
            while(!Thread.interrupted()){
                try {
                    buf = new byte[511];
                    dp = new DatagramPacket(buf, buf.length);
                    ds.receive(dp);
                    data = new String(dp.getData(), "UTF-8");
                    if(data.startsWith("HELLOSENSOR")){
                        data = data.substring("HELLOSENSOR".length(), data.length());
                        entry = sensors.put(dp.getSocketAddress(), data.trim());
                        lastUpdated.put(dp.getSocketAddress(), System.currentTimeMillis()/1000);
                        //System.out.println(getJSONString());
                        //System.out.println("");
                    }else{
                        System.out.println("Greetings unknown :(");
                    }
                }catch (SocketTimeoutException e){
                    //System.out.print(".");
                }
            }
        }catch(IOException e){
            System.err.println(e);
        }
    }
    
    public synchronized String getJSONString(){
        String result = "[";
        for (SocketAddress sa : sensors.keySet()){
            if ( System.currentTimeMillis()/1000 - lastUpdated.get(sa) <= 10){
                result += sensors.get(sa) + ", ";
            } else {
                sensors.remove(sa);
                lastUpdated.remove(sa);
            }
        }
        if (result.length() < 2) return "[]";
        result = result.substring(0, result.length()-2) + "]";
        System.out.println(result);
        return result;
    }
    
    public static void main(String[] args) throws Exception{
        if(args.length < 2 ) {
            System.out.println("    Usage: java SensorDataReceiver <ip> <receiver_port>");
            return;
        }
       
        
        
        Server server = new Server(new InetSocketAddress(InetAddress.getByName(args[0]), 80));

        ServletContextHandler context = new ServletContextHandler();
        context.setContextPath("/");
        
        SensorDataReceiver thSensor = new SensorDataReceiver(args[0], Integer.parseInt(args[1]));
        Thread t1 = new Thread(thSensor);
        SensorServlet sensorServlet = new SensorServlet(thSensor);
        ServletHolder servletHolder = new ServletHolder(sensorServlet);
        context.addServlet(servletHolder, "/esriths");

        SensorDataReceiver usSensor = new SensorDataReceiver(args[0], Integer.parseInt(args[1])+1);
        Thread t2 = new Thread(usSensor);
        SensorServlet ussServlet = new SensorServlet(usSensor);
        ServletHolder sh2 = new ServletHolder(ussServlet);
        context.addServlet(sh2, "/jababeka");

        server.setHandler(context);
        t1.start();
        t2.start();
        server.start();
        server.join();
        t1.join();
        t2.join();
    }
}