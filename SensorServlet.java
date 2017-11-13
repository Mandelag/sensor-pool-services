import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


public class SensorServlet extends HttpServlet {
    
    SensorDataReceiver sdr;
    
    public SensorServlet(SensorDataReceiver sdr){
        this.sdr = sdr;
    }
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
    {
        resp.setContentType("text/plain");
        resp.addHeader("Access-Control-Allow-Origin", "*");
        resp.getWriter().println(sdr.getJSONString());
    }
    
}