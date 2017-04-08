package com.cisco.scm.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;

import static com.cisco.scm.util.ApplicationConstants.*;

public class ResponseProcessUtil {
	
	private static final Logger LOG = Logger.getLogger(ResponseProcessUtil.class);
	
	public static SolrDocumentList getDistictRecords(SolrDocumentList results, int limit) {
		SolrDocumentList distinctDocs = new SolrDocumentList();
		List<String> visitedDocs = new ArrayList<>();
		if (results != null && results.size() > 0) {
			for (SolrDocument sd : results) {
				if (distinctDocs.size() >= limit) {
					break;
				}

				String component = (sd.get("cpn_name") != null) ? ((String) sd.get("cpn_name")) : null;
				if (component != null && !visitedDocs.contains(component)) {
					visitedDocs.add(component);
					distinctDocs.add(sd);
				}

			}
		}

		results.retainAll(distinctDocs);
		return results;

	}
	
	public static Map<String, Object> setError(Map<String, Object> result, String errorCode, 
			String msg, HttpServletResponse response){
		response.setStatus( HttpServletResponse.SC_BAD_REQUEST  );
		result.put(STATUS, FAILED);
		result.put(MESSAGE, msg);
		result.put(ERROR, errorCode);
		return result;
	}
	
	public static Map<String, Object> setSuccess(Map<String, Object> result, String msg){
		result.put(STATUS, SUCCESS);
		result.put(MESSAGE, msg);
		return result;
	}

}
