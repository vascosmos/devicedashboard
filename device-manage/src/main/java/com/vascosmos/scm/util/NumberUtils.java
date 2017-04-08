package com.vascosmos.scm.util;

public class NumberUtils {
	public static int randomInt(int Min, int Max)
	{
	     return (int) (Math.random()*(Max-Min))+Min;
	}

}
