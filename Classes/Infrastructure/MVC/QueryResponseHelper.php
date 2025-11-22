<?php

/*
 * This file is part of the Neos.Neos.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

declare(strict_types=1);

namespace Neos\Neos\Ui\Infrastructure\MVC;

use GuzzleHttp\Psr7\Response;
use Neos\Flow\Annotations as Flow;
use Psr\Http\Message\ResponseInterface;

/**
 * @internal only to be used inside the Neos Ui package
 */
#[Flow\Proxy(false)]
final class QueryResponseHelper
{
    private const STATUS_CODE_OK = 200;
    private const STATUS_CODE_BAD_REQUEST = 400;
    /** @phpstan-ignore classConstant.unused */
    private const STATUS_CODE_INTERNAL_SERVER_ERROR = 500;

    private const DISCRIMINATOR_SUCCESS = 'success';
    private const DISCRIMINATOR_ERROR = 'error';

    private function __construct()
    {
    }

    /**
     * @param array<mixed>|\JsonSerializable $payload
     */
    public static function createSuccess(array|\JsonSerializable $payload): ResponseInterface
    {
        return self::toHttpResponse(
            statusCode: self::STATUS_CODE_OK,
            discriminator: self::DISCRIMINATOR_SUCCESS,
            payload: $payload,
        );
    }

    public static function createServerSideErrorForBadRequest(\Exception $exception): ResponseInterface
    {
        return self::toHttpResponse(
            statusCode: self::STATUS_CODE_BAD_REQUEST,
            discriminator: self::DISCRIMINATOR_ERROR,
            payload: [
                'class' => $exception::class,
                'code' => $exception->getCode(),
                'message' => $exception->getMessage(),
            ],
        );
    }

    public static function createServerSideError(\Exception $exception, bool $includeStackTrace): ResponseInterface
    {
        return self::toHttpResponse(
            // todo set response code correctly to 500 (self::STATUS_CODE_INTERNAL_SERVER_ERROR) (which upsets the fetchWithErrorHandling and avoids the error view)
            statusCode: self::STATUS_CODE_OK,
            discriminator: self::DISCRIMINATOR_ERROR,
            payload: [
                'class' => $exception::class,
                'code' => $exception->getCode(),
                'message' => $exception->getMessage(),
                ...($includeStackTrace ? ['trace' => $exception->getTraceAsString()] : [])
            ],
        );
    }

    /**
     * @param array<mixed>|\JsonSerializable $payload
     */
    private static function toHttpResponse(int $statusCode, string $discriminator, array|\JsonSerializable $payload): ResponseInterface
    {
        return new Response(
            status: $statusCode,
            headers: [
                'Content-Type' => 'application/json'
            ],
            body: json_encode(
                [$discriminator => $payload],
                JSON_THROW_ON_ERROR
            )
        );
    }
}
